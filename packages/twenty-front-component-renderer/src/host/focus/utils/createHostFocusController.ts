import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type HostFocusController } from '@/host/focus/types/HostFocusController';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

type PendingFocusRequest = {
  remoteElementId: string;
  options?: FocusOptions;
};

export const createHostFocusController = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): HostFocusController => {
  let pendingFocusRequest: PendingFocusRequest | null = null;

  const findRegisteredElement = (remoteElementId: string) =>
    geometryTracker.getRegisteredNode(remoteElementId) as
      | HTMLElement
      | SVGElement
      | undefined;

  const focusElement = ({ remoteElementId, options }: PendingFocusRequest) => {
    const element = findRegisteredElement(remoteElementId);

    if (!isDefined(element) || !isFunction(element.focus)) {
      return;
    }

    element.focus(options);

    if (element.ownerDocument.activeElement === element) {
      pendingFocusRequest = null;
    }
  };

  return {
    callFocusMethod: ({ remoteElementId, methodName, options }) => {
      if (methodName === 'focus') {
        pendingFocusRequest = { remoteElementId, options };
        focusElement(pendingFocusRequest);
        return;
      }

      if (pendingFocusRequest?.remoteElementId === remoteElementId) {
        pendingFocusRequest = null;
      }

      const element = findRegisteredElement(remoteElementId);

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
      pendingFocusRequest = null;
    },
  };
};
