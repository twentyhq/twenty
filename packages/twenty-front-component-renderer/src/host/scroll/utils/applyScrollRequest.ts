import { isDefined } from 'twenty-shared/utils';

import { scrollOwnedAncestorsIntoView } from '@/host/scroll/utils/scrollOwnedAncestorsIntoView';
import { type ScrollRequest } from '@/types/ScrollRequest';

export const applyScrollRequest = ({
  node,
  request,
  isOwnedNode,
}: {
  node: Element;
  request: ScrollRequest;
  isOwnedNode: (node: Element) => boolean;
}): Element[] => {
  if (request.method === 'scrollIntoView') {
    return scrollOwnedAncestorsIntoView({
      target: node,
      block: request.block,
      inline: request.inline,
      isOwnedNode,
    });
  }

  node.scrollTo({
    ...(isDefined(request.top) && { top: request.top }),
    ...(isDefined(request.left) && { left: request.left }),
    behavior: 'instant',
  });

  return [node];
};
