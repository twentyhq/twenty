import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { SCROLL_BRIDGE_PROPERTIES } from '@/constants/ScrollBridgeProperties';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type AcknowledgedScrollPosition } from '@/polyfills/scroll/types/AcknowledgedScrollPosition';
import { type EventScrollState } from '@/polyfills/scroll/types/EventScrollState';
import { type WorkerScrollStore } from '@/polyfills/scroll/types/WorkerScrollStore';
import { elideEchoedScrollAxes } from '@/polyfills/scroll/utils/elideEchoedScrollAxes';
import { findSelfOrAncestorByRemoteId } from '@/polyfills/scroll/utils/findSelfOrAncestorByRemoteId';
import { isScrollCommandTarget } from '@/polyfills/scroll/utils/isScrollCommandTarget';
import { readSerializedEventScrollState } from '@/polyfills/scroll/utils/readSerializedEventScrollState';
import { resolveOptimisticScrollOffset } from '@/polyfills/scroll/utils/resolveOptimisticScrollOffset';
import { createRemoteElementCommandQueue } from '@/polyfills/utils/createRemoteElementCommandQueue';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';
import { type ScrollCommandAcknowledgement } from '@/types/ScrollCommandAcknowledgement';
import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';
import { type ScrollRequest } from '@/types/ScrollRequest';

const SCROLL_OFFSET_PROPERTY_BY_AXIS = {
  top: 'scrollTop',
  left: 'scrollLeft',
} as const satisfies Record<ScrollAxis, keyof EventScrollState>;

export const createWorkerScrollStore = ({
  geometryStore,
}: {
  geometryStore: WorkerGeometryStore;
}): WorkerScrollStore => {
  const commandQueue = createRemoteElementCommandQueue<ScrollRequest>({
    bridgeProperty: SCROLL_BRIDGE_PROPERTIES.request,
    maxPendingCommands: MAX_PENDING_SCROLL_COMMANDS,
  });
  const acknowledgedScrollPositions = new WeakMap<
    object,
    AcknowledgedScrollPosition
  >();
  const lastReadScrollOffsets = new WeakMap<object, ScrollAxisOffsets>();
  const eventScrollStates = new Map<object, EventScrollState>();
  const hostScrollSubscriptions = new WeakMap<
    object,
    (acknowledgement: ScrollCommandAcknowledgement) => void
  >();
  const trackedElements = new Set<object>();
  const pendingRevealTargets = new Set<object>();

  let rootElement: object | null = null;
  let hasScheduledDetachedElementSweep = false;
  let hasScheduledEventScrollStateClear = false;

  const readHostScrollOffset = ({
    element,
    axis,
  }: {
    element: object;
    axis: ScrollAxis;
  }): number => {
    const scrollOffsetProperty = SCROLL_OFFSET_PROPERTY_BY_AXIS[axis];
    const eventScrollOffset =
      eventScrollStates.get(element)?.[scrollOffsetProperty];

    if (isDefined(eventScrollOffset)) {
      return eventScrollOffset;
    }

    const snapshot = geometryStore.resolveElementSnapshot(element);
    const acknowledgedScrollPosition = acknowledgedScrollPositions.get(element);

    if (
      isDefined(acknowledgedScrollPosition) &&
      acknowledgedScrollPosition.baseSnapshot === snapshot
    ) {
      return acknowledgedScrollPosition[axis];
    }

    return snapshot?.[scrollOffsetProperty] ?? 0;
  };

  const readCurrentScrollOffset = ({
    element,
    axis,
  }: {
    element: object;
    axis: ScrollAxis;
  }): number =>
    resolveOptimisticScrollOffset({
      hostOffset: readHostScrollOffset({ element, axis }),
      pendingCommands: commandQueue.readPendingCommands(element),
      axis,
    });

  const recordAcknowledgedScrollPosition = ({
    element,
    scrolledElementPosition,
  }: {
    element: object;
    scrolledElementPosition: ScrolledElementPosition;
  }): void => {
    const { remoteElementId, scrollTop, scrollLeft } = scrolledElementPosition;

    if (!isNumber(scrollTop) || !isNumber(scrollLeft)) {
      return;
    }

    const scrolledElement = findSelfOrAncestorByRemoteId({
      element,
      remoteElementId,
      rootElement,
    });

    if (!isDefined(scrolledElement)) {
      return;
    }

    acknowledgedScrollPositions.set(scrolledElement, {
      top: scrollTop,
      left: scrollLeft,
      baseSnapshot: geometryStore.resolveElementSnapshot(scrolledElement),
    });
    trackedElements.add(scrolledElement);
  };

  const forgetSettledRevealTarget = (element: object): void => {
    const hasPendingReveal = commandQueue
      .readPendingCommands(element)
      .some(({ request }) => request.method === 'scrollIntoView');

    if (!hasPendingReveal) {
      pendingRevealTargets.delete(element);
    }
  };

  const hasPendingRevealInside = (element: object): boolean => {
    for (const revealTarget of pendingRevealTargets) {
      if (
        revealTarget !== element &&
        isElementUnderRemoteRoot(revealTarget, element)
      ) {
        return true;
      }
    }

    return false;
  };

  const renewHostScrollSubscription = (element: object): void => {
    const handleScrollUpdate = (
      acknowledgement: ScrollCommandAcknowledgement,
    ) => {
      const isLatestSubscription =
        hostScrollSubscriptions.get(element) === handleScrollUpdate;

      if (
        !isLatestSubscription ||
        !isElementUnderRemoteRoot(element, rootElement)
      ) {
        return;
      }

      commandQueue.acknowledgeCommands({
        element,
        acknowledgedCommandSequence: acknowledgement.scrollCommandSequence,
      });
      forgetSettledRevealTarget(element);

      for (const scrolledElementPosition of acknowledgement.scrollPositions) {
        recordAcknowledgedScrollPosition({ element, scrolledElementPosition });
      }
    };

    hostScrollSubscriptions.set(element, handleScrollUpdate);
    updateRemoteElementProperty(
      element as Element,
      SCROLL_BRIDGE_PROPERTIES.update,
      handleScrollUpdate,
    );
  };

  const subscribeToHostScroll = (element: object): void => {
    trackedElements.add(element);

    if (!hostScrollSubscriptions.has(element)) {
      renewHostScrollSubscription(element);
    }
  };

  const forgetDetachedElement = (element: object): void => {
    trackedElements.delete(element);
    pendingRevealTargets.delete(element);
    acknowledgedScrollPositions.delete(element);
    lastReadScrollOffsets.delete(element);
    commandQueue.discardPendingCommands(element);

    if (hostScrollSubscriptions.has(element)) {
      renewHostScrollSubscription(element);
    }
  };

  const sweepDetachedElements = (): void => {
    hasScheduledDetachedElementSweep = false;

    for (const element of trackedElements) {
      if (isElementUnderRemoteRoot(element, rootElement)) {
        continue;
      }

      forgetDetachedElement(element);
    }
  };

  const clearEventScrollStates = (): void => {
    hasScheduledEventScrollStateClear = false;
    eventScrollStates.clear();
  };

  const resolveRequestToEnqueue = ({
    element,
    request,
  }: {
    element: object;
    request: ScrollRequest;
  }): ScrollRequest | null => {
    if (
      request.method === 'scrollIntoView' ||
      hasPendingRevealInside(element)
    ) {
      return request;
    }

    const remainingOffsets = elideEchoedScrollAxes({
      requestedOffsets: request,
      lastReadOffsets: lastReadScrollOffsets.get(element),
      currentOffsets: {
        top: readCurrentScrollOffset({ element, axis: 'top' }),
        left: readCurrentScrollOffset({ element, axis: 'left' }),
      },
    });

    if (!isDefined(remainingOffsets.top) && !isDefined(remainingOffsets.left)) {
      return null;
    }

    return { method: 'scrollTo', ...remainingOffsets };
  };

  return {
    setRootElement: (nextRootElement) => {
      rootElement = nextRootElement;
    },
    isScrollCommandTarget: (element) =>
      isScrollCommandTarget({ element, rootElement }),
    readScrollOffset: ({ element, axis }) => {
      const scrollOffset = readCurrentScrollOffset({ element, axis });

      lastReadScrollOffsets.set(element, {
        ...lastReadScrollOffsets.get(element),
        [axis]: scrollOffset,
      });

      return scrollOffset;
    },
    readEventScrollExtent: ({ element, extent }) =>
      eventScrollStates.get(element)?.[extent],
    requestScroll: ({ element, request }) => {
      if (!isScrollCommandTarget({ element, rootElement })) {
        return;
      }

      const requestToEnqueue = resolveRequestToEnqueue({ element, request });

      if (!isDefined(requestToEnqueue)) {
        return;
      }

      subscribeToHostScroll(element);
      commandQueue.enqueueCommand({ element, request: requestToEnqueue });

      if (requestToEnqueue.method === 'scrollIntoView') {
        pendingRevealTargets.add(element);
      }
    },
    observeEventTarget: ({ element, eventData }) => {
      const eventScrollState = readSerializedEventScrollState(eventData);

      if (!isDefined(eventScrollState)) {
        return;
      }

      eventScrollStates.set(element, eventScrollState);

      if (hasScheduledEventScrollStateClear) {
        return;
      }

      hasScheduledEventScrollStateClear = true;
      queueMicrotask(clearEventScrollStates);
    },
    scheduleDetachedElementSweep: () => {
      if (hasScheduledDetachedElementSweep || trackedElements.size === 0) {
        return;
      }

      hasScheduledDetachedElementSweep = true;
      queueMicrotask(sweepDetachedElements);
    },
  };
};
