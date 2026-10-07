import { isDefined } from 'twenty-shared/utils';

import { NODE_FILTER } from '@/polyfills/dom/constants/NodeFilter';
import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type WorkerTextTreeWalker } from '@/polyfills/dom/types/WorkerTextTreeWalker';
import { findNextNodeInTreeOrderWithinRoot } from '@/polyfills/dom/utils/findNextNodeInTreeOrderWithinRoot';

export const createWorkerTextTreeWalker = (
  root: Node,
): WorkerTextTreeWalker => {
  let currentNode = root;

  return {
    root,
    whatToShow: NODE_FILTER.SHOW_TEXT,
    filter: null,
    get currentNode() {
      return currentNode;
    },
    set currentNode(node: Node) {
      currentNode = node;
    },
    nextNode: () => {
      let candidateNode = findNextNodeInTreeOrderWithinRoot({
        node: currentNode,
        root,
      });

      while (isDefined(candidateNode)) {
        if (candidateNode.nodeType === NODE_TYPE_BY_NAME.TEXT) {
          currentNode = candidateNode;

          return candidateNode;
        }

        candidateNode = findNextNodeInTreeOrderWithinRoot({
          node: candidateNode,
          root,
        });
      }

      return null;
    },
  };
};
