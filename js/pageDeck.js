; (function (window, undefined) {

    function PageDeck(obj) {
        this.ele = obj.ele;     //需要放入的标签的选择器  ele
        this.total = obj.total;     // 分页数据总数 number
        this.pitch = obj.pitch || 1;    //分页器当前选中 number
        this.sideBtn = obj.sideBtn;     // 是否展示上下一页按钮 Boolean
        this.pageNum = obj.pageNum || 10;   //默认一页需要展示的数据number
        this.pageChage = obj.onPageChange;  //页码改变的时候的回调函数，参数为页码和每页的条数 function(currentPage,pageNum)
        this.showOnePage = obj.showOnePage || false; //当只有一页的时候是否隐藏分页器Boolean
        this.showChangeSize = obj.showChangeSize || false;  //是否显示改变每页显示多少条数据Boolean
        this.pageSizeOptions = obj.pageSizeOptions || [10, 20, 30, 40];   //用于设置改变每页显示多少条数据[10,20] array
        this.sizeChange = obj.onSizeChange;     // 数量改变时候的回调函数，参数为当前页码和每页的条数 function(currentPage,pageNum);
        this.showQuickJumper = obj.showQuickJumper || false;    // 是否展示快速跳转至某一页 Boolean 
        this._btn_forbidden = Math.ceil(this.total / this.pageNum); //内部计算的出当前应该含有多少分页页码
        this._init();
    };
    PageDeck.prototype = {
        _init: function () {
            this._setUp();
            this._pageClick();
            !!this.showChangeSize && this._pageNumChange();
            !!this.showQuickJumper && this._quickJumperEnter();
        },
        // 创建插件
        _setUp: function () {
            $(this.ele).empty();
            if (this._btn_forbidden === 1 && !this.showOnePage) {
                return;
            }
            var _dom_str = '<ul class="ul-box">';
            var _prevBtn = this._btnIf('prev');
            var _nextBtn = this._btnIf('next');
            _dom_str += _prevBtn;
            if (this._btn_forbidden < 10) {
                for (var i = 1; i <= this._btn_forbidden; i++) {
                    if (i === this.pitch) {
                        _dom_str += '<li class="page-item page-item-active" title="' + (i) + '"><a>' + (i) + '</a></li>';
                    } else {
                        _dom_str += '<li class="page-item" title="' + (i) + '"><a>' + (i) + '</a></li>';
                    }
                };
            } else if (this._btn_forbidden >= 10 && this.pitch < this._btn_forbidden - 3) {
                if (this.pitch < 5) {
                    for (var j = 1; j <= 7; j++) {
                        if (j === this.pitch) {
                            _dom_str += '<li class="page-item page-item-active" title="' + (j) + '"><a>' + (j) + '</a></li>';
                        } else {
                            _dom_str += '<li class="page-item" title="' + (j) + '"><a>' + (j) + '</a></li>';
                        }
                    }
                } else if (this.pitch >= 5) {
                    _dom_str += '<li class="page-item" title="1"><a>1</a></li><li class="page-omit" title="向前5页"><a>···</a></li>';
                    for (var n = 0; n < 5; n++) {
                        if (n === 2) {
                            _dom_str += '<li class="page-item page-item-active" title="' + this.pitch + '"><a>' + this.pitch + '</a></li>';
                        } else {
                            _dom_str += '<li class="page-item" title="' + (this.pitch + (n - 2)) + '"><a>' + (this.pitch + (n - 2)) + '</a></li>';
                        }

                    }
                };
                _dom_str += '<li class="page-omit" title="向后5页"><a>···</a></li><li class="page-item" title="' + this._btn_forbidden + '"><a>' + this._btn_forbidden + '</a></li>'
            } else {
                _dom_str += '<li class="page-item" title="1"><a>1</a></li><li class="page-omit" title="向前5页"><a>···</a></li>';
                for (var m = 6; m >= 0; m--) {
                    if (this._btn_forbidden - m === this.pitch) {
                        _dom_str += '<li class="page-item page-item-active" title="' + (this.pitch) + '"><a>' + (this.pitch) + '</a></li>';
                    } else {
                        _dom_str += '<li class="page-item" title="' + (this._btn_forbidden - m) + '"><a>' + (this._btn_forbidden - m) + '</a></li>';
                    }
                }
            }
            _dom_str += _nextBtn;
            _dom_str += this._pageSelect();
            _dom_str += this._quickJumper();
            _dom_str += '</ul>';
            $(this.ele).append($(_dom_str));
        },
        // 两侧按钮
        _btnIf: function (flag) {
            var btnEle = '';
            if (this.sideBtn !== false) {
                if (flag === 'prev') {
                    if (this.pitch > this._btn_forbidden) {
                        this.pitch = 1;
                    } else if (this._btn_forbidden === 1) {
                        this.pitch = 1;
                    } else if (this.pitch <= 0) {
                        this.pitch = 1;
                    }
                    btnEle = this.pitch === 1 ? '<li class="pre-page forbidden_btn" title="上一页"><a>&lt;</a></li>' : '<li class="pre-page" title="上一页"><a>&lt;</a></li>';
                } else if (flag === 'next') {
                    if (this._btn_forbidden === 1 || this.pitch === this._btn_forbidden) {
                        btnEle = '<li class="pre-page forbidden_btn" title="下一页"><a>&gt;</a></li>';
                    } else {
                        btnEle = '<li class="pre-page" title="下一页"><a>&gt;</a></li>';
                    }
                }
            } else {
                if (this.pitch > this._btn_forbidden) {
                    this.pitch = 1;
                }
            }
            return btnEle;
        },
        // 下拉选择框
        _pageSelect: function () {
            var pageselect = '';
            if (this.showChangeSize && this.total > this.pageSizeOptions[0]) {
                pageselect += '<li class="page-size-part"><div class="page-size-box" tabindex="0">';
                pageselect += '<div class="select-page-size-box"><span class="select-text" title="' + this.pageNum + '条/页">' + this.pageNum + '条/页</span><span class="select-tria"></span></div>';
                pageselect += '<div class="select-option"><ul class="select-option-ul">';
                for (var k = 0; k < this.pageSizeOptions.length; k++) {
                    if (this.pageSizeOptions[k] == this.pageNum) {
                        pageselect += '<li title="' + this.pageSizeOptions[k] + '条/页" class="select-option-active" >' + this.pageSizeOptions[k] + '条/页</li>'
                    } else {
                        pageselect += '<li title="' + this.pageSizeOptions[k] + '条/页">' + this.pageSizeOptions[k] + '条/页</li>'
                    }
                }
                pageselect += '</ul></div></div></li>'
            }
            return pageselect;
        },
        // 跳转页面
        _quickJumper: function () {
            var quickJumper = '';
            if (this.showQuickJumper) {
                quickJumper += '<li class="page-jumper-box">跳转';
                quickJumper += '<input type="text" class="jumper_text" />'
                quickJumper += '页</li>'
            };
            return quickJumper
        },
        // 添加页码事件
        _pageClick: function () {
            var that = this,
                entrustEle = $(that.ele + ' .ul-box');    // 委托元素
            // 小于10个分页时候的点击事件，只更改当前的已有生成分页的的class，用作区分，事件拿权当前页码等事件方法后边在做调整，
            if (this._btn_forbidden < 10) {
                // 内部数字的点击事件
                entrustEle.on('click', '.page-item', function () {
                    if ($(this).attr('title') == that.pitch) {    //如果点击的是当前按钮，直接返回操作
                        return;
                    };
                    $(this).addClass('page-item-active').siblings().removeClass('page-item-active');
                    if ($(this).attr('title') === $(that.ele + ' .page-item:first').attr('title')) {
                        $(that.ele + ' .pre-page:first').addClass('forbidden_btn').siblings().removeClass('forbidden_btn');
                    } else if ($(this).attr('title') === $(that.ele + ' .page-item:last').attr('title')) {
                        $(that.ele + ' .pre-page:last').addClass('forbidden_btn').siblings().removeClass('forbidden_btn');
                    } else {
                        $(that.ele + ' .pre-page').removeClass('forbidden_btn');
                    };
                    var currentPage = parseInt($(that.ele + ' .page-item-active').attr('title'));
                    that.pitch = currentPage;
                    that.pageChage && that.pageChage(currentPage, that.pageNum);
                });
                // 上下的点击事件
                entrustEle.on('click', '.pre-page', function () {
                    if ($(this).hasClass('forbidden_btn')) {
                        return;
                    } else if ($(this).attr('title') === $(that.ele + ' .pre-page:first').attr('title')) {
                        $(this).siblings().hasClass('forbidden_btn') && $(this).siblings().removeClass('forbidden_btn');
                        $(that.ele + ' .page-item-active').prev().addClass('page-item-active').end().removeClass('page-item-active');
                        if ($(that.ele + ' .page-item-active').attr('title') === $(that.ele + ' .page-item:first').attr('title')) {
                            $(that.ele + ' .pre-page:first').addClass('forbidden_btn');
                        };
                    } else if ($(this).attr('title') === $(that.ele + ' .pre-page:last').attr('title')) {
                        $(this).siblings().hasClass('forbidden_btn') && $(this).siblings().removeClass('forbidden_btn');
                        $(that.ele + ' .page-item-active').next().addClass('page-item-active').end().removeClass('page-item-active');
                        if ($(that.ele + ' .page-item-active').attr('title') === $(that.ele + ' .page-item:last').attr('title')) {
                            $(that.ele + ' .pre-page:last').addClass('forbidden_btn');
                        };
                    };
                    var currentPage = parseInt($(that.ele + ' .page-item-active').attr('title'));
                    that.pageChage && that.pageChage(currentPage, that.pageNum);
                });

            } else {  // 大于等于10个分页的时候使用重新创建当前分页内部结构的方式改变选择
                entrustEle.on('click', '.page-item', function () {
                    if ($(this).attr('title') == that.pitch) {    //如果点击的是当前按钮，直接返回操作
                        return;
                    }
                    that.pitch = parseInt($(this).attr('title'));
                    that._init();
                    that.pageChage && that.pageChage(that.pitch, that.pageNum);
                });
                entrustEle.on('click', '.pre-page', function () {
                    if ($(this).hasClass('forbidden_btn')) {
                        return;
                    } else if ($(this).attr('title') === $(that.ele + ' .pre-page:first').attr('title')) {
                        that.pitch = parseInt($(that.ele + ' .page-item-active').prev().attr('title'));
                        that._init();
                    } else if ($(this).attr('title') === $(that.ele + ' .pre-page:last').attr('title')) {
                        that.pitch = parseInt($(that.ele + ' .page-item-active').next().attr('title'));
                        that._init();
                    };
                    that.pageChage && that.pageChage(that.pitch, that.pageNum);
                });

            }
        },
        // 添加数据量事件
        _pageNumChange: function () {
            var that = this;
            $(that.ele + ' .page-size-box').on('blur', function () {
                $(this).removeClass('select-option-show');
            });
            $(that.ele + ' .page-size-box').on('click', function () {
                if ($(this).hasClass('select-option-show')) {
                    $(this).removeClass('select-option-show');
                } else {
                    $(this).addClass('select-option-show');
                }
            });
            $(that.ele + ' .select-option').on('mousedown', 'li', function () {
                if ($(this).hasClass('select-option-active')) {
                    return
                } else {
                    that.pageNum = parseInt($(this).html());
                    that._btn_forbidden = Math.ceil(that.total / that.pageNum);
                    that._init();
                    that.sizeChange && that.sizeChange(that.pitch, that.pageNum);
                };
            });
        },
        // 添加跳转事件
        _quickJumperEnter: function () {
            var that = this;
            $(that.ele + ' .jumper_text').on('keydown', function (e) {
                var event = e || window.event;
                if (event.keyCode === 13) {
                    var jumperNum = parseInt($.trim($(this).val()));
                    if (!isNaN(jumperNum)) {
                        if (jumperNum >= that._btn_forbidden) {
                            jumperNum = that._btn_forbidden
                        };
                        that.pitch = jumperNum;
                        that._init();
                        that.pageChage && that.pageChage(that.pitch, that.pageNum);
                        $(that.ele + ' .jumper_text').focus();
                    } else {
                        $(this).addClass('jumper_text_error');
                    }
                };
            }).on('blur',function(){
                if(isNaN($(this).val().trim())){
                    return;
                }else if($(this).hasClass('jumper_text_error')){
                    $(this).removeClass('jumper_text_error');
                }
            }).on('input propertychange change',function(){
                var jumperNum = parseInt($(this).val().trim());
                if(isNaN(jumperNum)){
                    $(this).addClass('jumper_text_error');
                }else{
                    if($(this).hasClass('jumper_text_error')){
                        $(this).removeClass('jumper_text_error');
                    }
                    return;
                }
            })
        }
    };

    window.PageDeck = PageDeck;
})(window, undefined);
