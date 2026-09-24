import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type NodeWithIsConnected = {
  isConnected?: boolean;
};

const isElementConnectedToDocument = (element: object): boolean =>
  (element as NodeWithIsConnected).isConnected === true;

export const createWorkerActiveElementStore = (): WorkerActiveElementStore => {
  let activeElement: object | null = null;

  return {
    getActiveElement: () => {
      if (
        isDefined(activeElement) &&
        !isElementConnectedToDocument(activeElement)
      ) {
        activeElement = null;
      }

      return activeElement;
    },
    setActiveElement: (element) => {
      if (isDefined(element) && !isElementConnectedToDocument(element)) {
        return;
      }

      activeElement = element;
    },
  };
};
