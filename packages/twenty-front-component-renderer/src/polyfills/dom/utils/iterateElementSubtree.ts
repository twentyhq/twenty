import { isDefined } from 'twenty-shared/utils';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';

export function* iterateElementSubtree(
  rootElement: ElementLike,
): Generator<ElementLike> {
  const pendingNodes: ElementLike[] = [rootElement];

  while (pendingNodes.length > 0) {
    const currentNode = pendingNodes.pop() as ElementLike;

    yield currentNode;

    const childNodes = currentNode.childNodes;

    if (isDefined(childNodes)) {
      for (let index = childNodes.length - 1; index >= 0; index -= 1) {
        pendingNodes.push(childNodes[index] as ElementLike);
      }
    }
  }
}
