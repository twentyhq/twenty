import { isDefined } from 'twenty-shared/utils';

const SCROLLABLE_OVERFLOW_PATTERN = /auto|scroll/;

export const isScrollbarPress = (event: MouseEvent): boolean => {
  const { target } = event;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const { ownerDocument } = target;
  const computedStyle = ownerDocument.defaultView?.getComputedStyle(target);

  if (!isDefined(computedStyle)) {
    return false;
  }

  const isDocumentScroller =
    target === ownerDocument.documentElement || target === ownerDocument.body;
  const canScrollHorizontally =
    (isDocumentScroller ||
      SCROLLABLE_OVERFLOW_PATTERN.test(computedStyle.overflowX)) &&
    target.clientWidth > 0 &&
    target.scrollWidth > target.clientWidth;
  const canScrollVertically =
    (isDocumentScroller ||
      SCROLLABLE_OVERFLOW_PATTERN.test(computedStyle.overflowY)) &&
    target.clientHeight > 0 &&
    target.scrollHeight > target.clientHeight;
  const isPressOnVerticalScrollbar =
    canScrollVertically &&
    (computedStyle.direction === 'rtl'
      ? event.offsetX <= target.offsetWidth - target.clientWidth
      : event.offsetX > target.clientWidth);
  const isPressOnHorizontalScrollbar =
    canScrollHorizontally && event.offsetY > target.clientHeight;

  return isPressOnVerticalScrollbar || isPressOnHorizontalScrollbar;
};
