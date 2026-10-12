import { isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';

type NodeWithIsConnected = {
  isConnected?: boolean;
};

const isElementConnectedToDocument = (element: object): boolean =>
  (element as NodeWithIsConnected).isConnected ?? false;

export const createWorkerActiveElementStore = (): WorkerActiveElementStore => {
  let activeElement: object | null = null;
  let isFocusVisible = false;

  const getActiveElement = (): object | null => {
    if (
      isDefined(activeElement) &&
      !isElementConnectedToDocument(activeElement)
    ) {
      activeElement = null;
      isFocusVisible = false;
    }

    return activeElement;
  };

  return {
    getActiveElement,
    getFocusVisibleElement: () => (isFocusVisible ? getActiveElement() : null),
    setActiveElement: ({
      element,
      isFocusVisible: nextIsFocusVisible = false,
    }) => {
      if (isDefined(element) && !isElementConnectedToDocument(element)) {
        return;
      }

      activeElement = element;
      isFocusVisible = nextIsFocusVisible;
    },
  };
};
