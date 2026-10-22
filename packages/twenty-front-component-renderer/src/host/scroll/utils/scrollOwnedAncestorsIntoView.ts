import { isDefined } from 'twenty-shared/utils';

import { isFixedPositionStyle } from '@/host/scroll/utils/isFixedPositionStyle';
import { scrollContainerToRevealTarget } from '@/host/scroll/utils/scrollContainerToRevealTarget';
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

  if (isFixedPositionStyle(targetStyle)) {
    return scrollContainers;
  }

  let scrollContainer = target.parentElement;

  while (isDefined(scrollContainer) && isOwnedNode(scrollContainer)) {
    const scrollContainerStyle = getComputedStyle(scrollContainer);
    const isScrollContainer = scrollContainerToRevealTarget({
      target,
      targetStyle,
      scrollContainer,
      scrollContainerStyle,
      block,
      inline,
    });

    if (isScrollContainer) {
      scrollContainers.push(scrollContainer);
    }

    if (isFixedPositionStyle(scrollContainerStyle)) {
      break;
    }

    scrollContainer = scrollContainer.parentElement;
  }

  return scrollContainers;
};
