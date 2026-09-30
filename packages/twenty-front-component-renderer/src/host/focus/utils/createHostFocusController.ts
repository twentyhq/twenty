import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type HostFocusController } from '@/host/focus/types/HostFocusController';

type PendingFocusRequest = {
  remoteElementId: string;
  options?: FocusOptions;
};

export const createHostFocusController = (): HostFocusController => {
  const elements = new Map<string, HTMLElement | SVGElement>();
  let pendingFocusRequest: PendingFocusRequest | null = null;

  const focusElement = ({ remoteElementId, options }: PendingFocusRequest) => {
    const element = elements.get(remoteElementId);

    if (!isDefined(element) || !isFunction(element.focus)) {
      return;
    }

    element.focus(options);

    if (element.ownerDocument.activeElement === element) {
      pendingFocusRequest = null;
    }
  };

  return {
    registerElement: ({ remoteElementId, element }) => {
      elements.set(remoteElementId, element as HTMLElement | SVGElement);

      if (pendingFocusRequest?.remoteElementId === remoteElementId) {
        focusElement(pendingFocusRequest);
      }
    },
    unregisterElement: ({ remoteElementId, element }) => {
      if (elements.get(remoteElementId) === element) {
        elements.delete(remoteElementId);
      }
    },
    callFocusMethod: ({ remoteElementId, methodName, options }) => {
      if (methodName === 'focus') {
        pendingFocusRequest = { remoteElementId, options };
        focusElement(pendingFocusRequest);
        return;
      }

      if (pendingFocusRequest?.remoteElementId === remoteElementId) {
        pendingFocusRequest = null;
      }

      const element = elements.get(remoteElementId);

      if (isDefined(element) && isFunction(element.blur)) {
        element.blur();
      }
    },
    retryPendingFocus: () => {
      if (isDefined(pendingFocusRequest)) {
        focusElement(pendingFocusRequest);
      }
    },
    reset: () => {
      elements.clear();
      pendingFocusRequest = null;
    },
  };
};
