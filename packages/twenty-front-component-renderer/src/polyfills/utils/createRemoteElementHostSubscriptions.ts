import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';

export const createRemoteElementHostSubscriptions = <THostUpdate>({
  updateBridgeProperty,
  readRootElement,
  onHostUpdate,
  onForgetElement,
}: {
  updateBridgeProperty: string;
  readRootElement: () => object | null;
  onHostUpdate: (input: { element: object; hostUpdate: THostUpdate }) => void;
  onForgetElement: (element: object) => void;
}) => {
  const hostUpdateSubscriptions = new WeakMap<
    object,
    (hostUpdate: THostUpdate) => void
  >();
  const trackedElements = new Set<object>();

  let hasScheduledDetachedElementSweep = false;

  const renewHostUpdateSubscription = (element: object): void => {
    const handleHostUpdate = (hostUpdate: THostUpdate) => {
      const isLatestSubscription =
        hostUpdateSubscriptions.get(element) === handleHostUpdate;

      if (
        !isLatestSubscription ||
        !isElementUnderRemoteRoot(element, readRootElement())
      ) {
        return;
      }

      onHostUpdate({ element, hostUpdate });
    };

    hostUpdateSubscriptions.set(element, handleHostUpdate);

    if (!isElementNode(element)) {
      return;
    }

    updateRemoteElementProperty(
      element,
      updateBridgeProperty,
      handleHostUpdate,
    );
  };

  const trackElement = (element: object): void => {
    trackedElements.add(element);
  };

  const subscribe = (element: object): void => {
    trackedElements.add(element);

    if (!hostUpdateSubscriptions.has(element)) {
      renewHostUpdateSubscription(element);
    }
  };

  const forgetDetachedElement = (element: object): void => {
    trackedElements.delete(element);
    onForgetElement(element);

    if (hostUpdateSubscriptions.has(element)) {
      renewHostUpdateSubscription(element);
    }
  };

  const sweepDetachedElements = (): void => {
    hasScheduledDetachedElementSweep = false;

    for (const element of trackedElements) {
      if (isElementUnderRemoteRoot(element, readRootElement())) {
        continue;
      }

      forgetDetachedElement(element);
    }
  };

  const scheduleDetachedElementSweep = (): void => {
    if (hasScheduledDetachedElementSweep || trackedElements.size === 0) {
      return;
    }

    hasScheduledDetachedElementSweep = true;
    queueMicrotask(sweepDetachedElements);
  };

  return { trackElement, subscribe, scheduleDetachedElementSweep };
};
