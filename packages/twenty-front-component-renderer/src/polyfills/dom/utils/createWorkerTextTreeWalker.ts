import { isDefined } from 'twenty-shared/utils';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { NODE_FILTER } from '@/polyfills/dom/constants/NodeFilter';

const getNextDescendant = ({
  node,
  root,
}: {
  node: Node;
  root: Node;
}): Node | null => {
  if (isDefined(node.firstChild)) {
    return node.firstChild;
  }

  let ancestor: Node | null = node;

  while (isDefined(ancestor) && ancestor !== root) {
    if (isDefined(ancestor.nextSibling)) {
      return ancestor.nextSibling;
    }

    ancestor = ancestor.parentNode;
  }

  return null;
};

export const createWorkerTextTreeWalker = (
  root: Node,
): Pick<
  TreeWalker,
  'root' | 'currentNode' | 'nextNode' | 'whatToShow' | 'filter'
> => {
  let currentNode = root;

  return {
    root,
    whatToShow: NODE_FILTER.SHOW_TEXT,
    filter: null,
    get currentNode() {
      return currentNode;
    },
    set currentNode(node) {
      currentNode = node;
    },
    nextNode: () => {
      let nextNode = getNextDescendant({ node: currentNode, root });

      while (isDefined(nextNode)) {
        if (nextNode.nodeType === NODE_TYPE_BY_NAME.TEXT) {
          currentNode = nextNode;

          return nextNode;
        }

        nextNode = getNextDescendant({ node: nextNode, root });
      }

      return null;
    },
  };
};
