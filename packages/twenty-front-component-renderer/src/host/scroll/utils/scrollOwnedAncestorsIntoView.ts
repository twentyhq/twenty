import { isDefined } from 'twenty-shared/utils';

import { expandRectByScrollMargin } from '@/host/scroll/utils/expandRectByScrollMargin';
import { isScrollContainerOnAxis } from '@/host/scroll/utils/isScrollContainerOnAxis';
import { resolveElementScale } from '@/host/scroll/utils/resolveElementScale';
import { resolveInlineScrollIntoViewDelta } from '@/host/scroll/utils/resolveInlineScrollIntoViewDelta';
import { resolveScrollIntoViewDelta } from '@/host/scroll/utils/resolveScrollIntoViewDelta';
import { resolveScrollportBox } from '@/host/scroll/utils/resolveScrollportBox';
import { type ScrollIntoViewAlignment } from '@/types/ScrollIntoViewAlignment';

export const scrollOwnedAncestorsIntoView = ({
  target,
  block,
  inline,
  isOwnedNode,
}: {
  target: Element;
  block: ScrollIntoViewAlignment;
  inline: ScrollIntoViewAlignment;
  isOwnedNode: (node: Element) => boolean;
}): Element[] => {
  const scrollContainers: Element[] = [];

  if (target.getClientRects().length === 0) {
    return scrollContainers;
  }

  for (
    let scrollContainer = target.parentElement;
    isDefined(scrollContainer) && isOwnedNode(scrollContainer);
    scrollContainer = scrollContainer.parentElement
  ) {
    const scrollContainerStyle = getComputedStyle(scrollContainer);
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
      continue;
    }

    scrollContainers.push(scrollContainer);

    const scale = resolveElementScale(scrollContainer);
    const scrollport = resolveScrollportBox({
      scrollContainer,
      scrollContainerStyle,
      scale,
    });
    const targetBox = expandRectByScrollMargin({
      rect: target.getBoundingClientRect(),
      style: getComputedStyle(target),
      scale,
    });
    const blockDelta = canScrollBlock
      ? resolveScrollIntoViewDelta({
          elementStart: targetBox.top,
          elementEnd: targetBox.bottom,
          scrollportStart: scrollport.top,
          scrollportEnd: scrollport.bottom,
          alignment: block,
        })
      : 0;
    const inlineDelta = canScrollInline
      ? resolveInlineScrollIntoViewDelta({
          targetBox,
          scrollport,
          alignment: inline,
          isRightToLeft: scrollContainerStyle.direction === 'rtl',
        })
      : 0;

    if (blockDelta === 0 && inlineDelta === 0) {
      continue;
    }

    scrollContainer.scrollTo({
      top: scrollContainer.scrollTop + blockDelta / scale.y,
      left: scrollContainer.scrollLeft + inlineDelta / scale.x,
      behavior: 'instant',
    });
  }

  return scrollContainers;
};
