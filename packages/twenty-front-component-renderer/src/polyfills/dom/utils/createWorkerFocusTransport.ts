import { callRemoteElementMethod } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerFocusMethodRequest } from '@/polyfills/dom/types/WorkerFocusMethodRequest';
import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';

export const createWorkerFocusTransport = () => {
  let rootElement: object | null = null;
  let focusedElement: object | null = null;

  return {
    setRootElement: (element: object): void => {
      rootElement = element;
      focusedElement = null;
    },
    forwardFocusMethod: ({
      element,
      methodName,
      options,
    }: WorkerFocusMethodRequest): void => {
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return;
      }

      focusedElement = methodName === 'focus' ? element : null;
      callRemoteElementMethod(element as Element, methodName, options);
    },
    blurFocusedElementWithinSubtree: (node: object): void => {
      if (
        !isDefined(focusedElement) ||
        !isAncestorOrSelfOfNode(node, focusedElement)
      ) {
        return;
      }

      callRemoteElementMethod(focusedElement as Element, 'blur');
      focusedElement = null;
    },
  };
};
