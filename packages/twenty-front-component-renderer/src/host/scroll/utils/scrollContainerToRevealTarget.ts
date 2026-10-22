import { expandRectByScrollMargin } from '@/host/scroll/utils/expandRectByScrollMargin';
import { isScrollContainerOnAxis } from '@/host/scroll/utils/isScrollContainerOnAxis';
import { resolveBlockScrollIntoViewDelta } from '@/host/scroll/utils/resolveBlockScrollIntoViewDelta';
import { resolveElementScale } from '@/host/scroll/utils/resolveElementScale';
import { resolveInlineScrollIntoViewDelta } from '@/host/scroll/utils/resolveInlineScrollIntoViewDelta';
import { resolveScrollportBox } from '@/host/scroll/utils/resolveScrollportBox';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export const scrollContainerToRevealTarget = ({
  target,
  targetStyle,
  scrollContainer,
  scrollContainerStyle,
  block,
  inline,
}: {
  target: Element;
  targetStyle: Pick<
    CSSStyleDeclaration,
    | 'scrollMarginTop'
    | 'scrollMarginRight'
    | 'scrollMarginBottom'
    | 'scrollMarginLeft'
  >;
  scrollContainer: Element;
  scrollContainerStyle: Pick<
    CSSStyleDeclaration,
    | 'overflowX'
    | 'overflowY'
    | 'direction'
    | 'scrollPaddingTop'
    | 'scrollPaddingRight'
    | 'scrollPaddingBottom'
    | 'scrollPaddingLeft'
  >;
  block: ScrollIntoViewAlignment;
  inline: ScrollIntoViewAlignment;
}): boolean => {
  const canScrollBlock = isScrollContainerOnAxis({
    overflow: scrollContainerStyle.overflowY,
    scrollSize: scrollContainer.scrollHeight,
    clientSize: scrollContainer.clientHeight,
  });
  const canScrollInline = isScrollContainerOnAxis({
    overflow: scrollContainerStyle.overflowX,
    scrollSize: scrollContainer.scrollWidth,
    clientSize: scrollContainer.clientWidth,
  });

  if (!canScrollBlock && !canScrollInline) {
    return false;
  }

  const scale = resolveElementScale(scrollContainer);
  const scrollport = resolveScrollportBox({
    scrollContainer,
    scrollContainerStyle,
    scale,
  });
  const targetBox = expandRectByScrollMargin({
    rect: target.getBoundingClientRect(),
    style: targetStyle,
    scale,
  });
  const isRightToLeft = scrollContainerStyle.direction === 'rtl';
  const blockDelta = canScrollBlock
    ? resolveBlockScrollIntoViewDelta({
        targetBox,
        scrollport,
        alignment: block,
      })
    : 0;
  const inlineDelta = canScrollInline
    ? resolveInlineScrollIntoViewDelta({
        targetBox,
        scrollport,
        alignment: inline,
        isRightToLeft,
      })
    : 0;

  if (blockDelta === 0 && inlineDelta === 0) {
    return true;
  }

  scrollContainer.scrollTo({
    top: scrollContainer.scrollTop + blockDelta / scale.y,
    left: scrollContainer.scrollLeft + inlineDelta / scale.x,
    behavior: 'instant',
  });

  return true;
};
