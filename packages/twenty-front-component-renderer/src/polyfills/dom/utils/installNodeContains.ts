import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type NodeLike = { parentNode?: unknown };

// @remote-dom/polyfill 1.5.1 ships Node.contains with a cursor that never
// advances: it re-reads the argument's own parentNode on every pass instead of
// the current node's. Any node whose parent is neither the receiver nor null
// therefore loops forever, wedging the worker's event loop with no exception
// thrown, so timers and the remote-dom bridge stop with no visible error.
export const installNodeContains = (installTarget: object): void => {
  Object.defineProperty(installTarget, 'contains', {
    value: function (this: object, otherNode: unknown): boolean {
      let currentNode: object | null = isObject(otherNode) ? otherNode : null;

      while (isDefined(currentNode)) {
        if (currentNode === this) {
          return true;
        }

        const parentNode: unknown = (currentNode as NodeLike).parentNode;

        currentNode = isObject(parentNode) ? parentNode : null;
      }

      return false;
    },
    configurable: true,
    writable: true,
  });
};
