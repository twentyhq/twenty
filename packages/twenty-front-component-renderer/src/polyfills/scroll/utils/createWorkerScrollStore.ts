import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MAX_PENDING_SCROLL_COMMANDS } from '@/constants/MaxPendingScrollCommands';
import { SCROLL_BRIDGE_PROPERTIES } from '@/constants/ScrollBridgeProperties';
import { findSelfOrAncestorByRemoteId } from '@/polyfills/dom/utils/findSelfOrAncestorByRemoteId';
import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { SCROLL_OFFSET_PROPERTY_BY_AXIS } from '@/polyfills/scroll/constants/ScrollOffsetPropertyByAxis';
import { type AcknowledgedScrollPosition } from '@/polyfills/scroll/types/AcknowledgedScrollPosition';
import { type EventScrollState } from '@/polyfills/scroll/types/EventScrollState';
import { type HostScrollOffset } from '@/polyfills/scroll/types/HostScrollOffset';
import { type WorkerScrollStore } from '@/polyfills/scroll/types/WorkerScrollStore';
import { elideEchoedScrollAxes } from '@/polyfills/scroll/utils/elideEchoedScrollAxes';
import { hasPendingScrollWriteOnAxis } from '@/polyfills/scroll/utils/hasPendingScrollWriteOnAxis';
import { isScrollCommandTarget } from '@/polyfills/scroll/utils/isScrollCommandTarget';
import { readSerializedEventScrollState } from '@/polyfills/scroll/utils/readSerializedEventScrollState';
import { resolveOptimisticScrollOffset } from '@/polyfills/scroll/utils/resolveOptimisticScrollOffset';
import { createRemoteElementCommandQueue } from '@/polyfills/utils/createRemoteElementCommandQueue';
import { createRemoteElementHostSubscriptions } from '@/polyfills/utils/createRemoteElementHostSubscriptions';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';
import { type ScrollCommandAcknowledgement } from '@/types/ScrollCommandAcknowledgement';
import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';
import { type ScrollRequest } from '@/types/ScrollRequest';

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
  const pendingRevealTargets = new Set<object>();

  let rootElement: object | null = null;
  let hasScheduledEventScrollStateClear = false;

  const readHostScrollOffset = ({
    element,
    axis,
  }: {
    element: object;
    axis: ScrollAxis;
  }): HostScrollOffset => {
    const scrollOffsetProperty = SCROLL_OFFSET_PROPERTY_BY_AXIS[axis];
    const eventScrollOffset =
      eventScrollStates.get(element)?.[scrollOffsetProperty];

    if (isDefined(eventScrollOffset)) {
      return { offset: eventScrollOffset, isMeasured: true };
    }

    const snapshot = geometryStore.resolveElementSnapshot(element);
    const acknowledgedScrollPosition = acknowledgedScrollPositions.get(element);
    const isMeasured = isDefined(snapshot);

    if (
      isDefined(acknowledgedScrollPosition) &&
      acknowledgedScrollPosition.baseSnapshot === snapshot
    ) {
      return { offset: acknowledgedScrollPosition[axis], isMeasured };
    }

    return { offset: snapshot?.[scrollOffsetProperty] ?? 0, isMeasured };
  };

  const readCurrentScrollOffset = ({
    element,
    axis,
  }: {
    element: object;
    axis: ScrollAxis;
  }): number =>
    resolveOptimisticScrollOffset({
      hostOffset: readHostScrollOffset({ element, axis }).offset,
      pendingCommands: commandQueue.readPendingCommands(element),
      axis,
    });

  const readMeasuredScrollOffset = ({
    element,
    axis,
  }: {
    element: object;
    axis: ScrollAxis;
  }): number | undefined => {
    const hostScrollOffset = readHostScrollOffset({ element, axis });
    const pendingCommands = commandQueue.readPendingCommands(element);

    if (
      !hostScrollOffset.isMeasured &&
      !hasPendingScrollWriteOnAxis({ pendingCommands, axis })
    ) {
      return undefined;
    }

    return resolveOptimisticScrollOffset({
      hostOffset: hostScrollOffset.offset,
      pendingCommands,
      axis,
    });
  };

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
    hostScrollSubscriptions.trackElement(scrolledElement);
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
        isAncestorOrSelfOfNode(element, revealTarget)
      ) {
        return true;
      }
    }

    return false;
  };

  const hostScrollSubscriptions =
    createRemoteElementHostSubscriptions<ScrollCommandAcknowledgement>({
      updateBridgeProperty: SCROLL_BRIDGE_PROPERTIES.update,
      readRootElement: () => rootElement,
      onHostUpdate: ({ element, hostUpdate: acknowledgement }) => {
        commandQueue.acknowledgeCommands({
          element,
          acknowledgedCommandSequence: acknowledgement.scrollCommandSequence,
        });
        forgetSettledRevealTarget(element);

        for (const scrolledElementPosition of acknowledgement.scrollPositions) {
          recordAcknowledgedScrollPosition({
            element,
            scrolledElementPosition,
          });
        }
      },
      onForgetElement: (element) => {
        pendingRevealTargets.delete(element);
        acknowledgedScrollPositions.delete(element);
        lastReadScrollOffsets.delete(element);
        commandQueue.discardPendingCommands(element);
      },
    });

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
      readCurrentOffset: (axis) => readMeasuredScrollOffset({ element, axis }),
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

      hostScrollSubscriptions.subscribe(element);
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
    scheduleDetachedElementSweep:
      hostScrollSubscriptions.scheduleDetachedElementSweep,
  };
};
