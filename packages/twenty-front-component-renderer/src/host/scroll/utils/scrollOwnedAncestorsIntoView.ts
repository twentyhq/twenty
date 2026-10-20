import { isDefined } from 'twenty-shared/utils';

import { expandRectByScrollMargin } from '@/host/scroll/utils/expandRectByScrollMargin';
import { isScrollContainerOnAxis } from '@/host/scroll/utils/isScrollContainerOnAxis';
import { resolveBlockScrollIntoViewDelta } from '@/host/scroll/utils/resolveBlockScrollIntoViewDelta';
import { resolveElementScale } from '@/host/scroll/utils/resolveElementScale';
import { resolveInlineScrollIntoViewDelta } from '@/host/scroll/utils/resolveInlineScrollIntoViewDelta';
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

  const targetStyle = getComputedStyle(target);

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
