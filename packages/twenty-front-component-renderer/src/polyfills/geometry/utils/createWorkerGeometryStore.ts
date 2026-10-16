import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { type NodeLike } from '@/polyfills/dom/types/NodeLike';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { type ElementGeometryReader } from '@/polyfills/geometry/types/ElementGeometryReader';
import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createDocumentScopedElementGeometrySnapshot } from '@/polyfills/geometry/utils/createDocumentScopedElementGeometrySnapshot';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { isHostRenderedElement } from '@/polyfills/geometry/utils/isHostRenderedElement';
import { restoreUnchangedComputedStyle } from '@/polyfills/geometry/utils/restoreUnchangedComputedStyle';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

type ElementGeometryOwnership = {
  remoteElementId: string | null;
  readerCount: number;
  hasDirectReader: boolean;
  hasScheduledRelease: boolean;
};

export const createWorkerGeometryStore = (): WorkerGeometryStore => {
  const elementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const elementOwnerships = new WeakMap<object, ElementGeometryOwnership>();
  const observedRemoteElementIds = new Set<string>();
  const pendingObservationIds = new Set<string>();
  const geometryUpdateListeners = new Set<() => void>();

  let rootElement: object | null = null;
  let transport: GeometryObservationTransport | null = null;
  let viewportSnapshot: ViewportGeometrySnapshot | null = null;
  let hasScheduledObservationFlush = false;
  let hasScheduledGeometryUpdateNotification = false;
  let hasWarnedAboutObservationLimit = false;
  let hasWarnedAboutTransportFailure = false;

  const warnAboutTransportFailure = (): void => {
    if (hasWarnedAboutTransportFailure) {
      return;
    }

    hasWarnedAboutTransportFailure = true;
    console.warn(GEOMETRY_TRANSPORT_FAILURE_WARNING);
  };

  const notifyGeometryUpdateListeners = (): void => {
    for (const geometryUpdateListener of [...geometryUpdateListeners]) {
      geometryUpdateListener();
    }
  };

  const flushGeometryUpdateNotification = (): void => {
    hasScheduledGeometryUpdateNotification = false;
    notifyGeometryUpdateListeners();
  };

  const scheduleGeometryUpdateNotification = (): void => {
    if (hasScheduledGeometryUpdateNotification) {
      return;
    }

    hasScheduledGeometryUpdateNotification = true;
    queueMicrotask(flushGeometryUpdateNotification);
  };

  const flushPendingObservations = (): void => {
    hasScheduledObservationFlush = false;

    if (!isDefined(transport) || pendingObservationIds.size === 0) {
      return;
    }

    const remoteElementIds = [...pendingObservationIds];
    pendingObservationIds.clear();

    transport
      .observeElementGeometry(remoteElementIds)
      .catch(warnAboutTransportFailure);
  };

  const scheduleObservationFlush = (): void => {
    if (hasScheduledObservationFlush) {
      return;
    }

    hasScheduledObservationFlush = true;
    queueMicrotask(flushPendingObservations);
  };

  const enrollElement = (element: object): string | null => {
    if (observedRemoteElementIds.size >= MAX_OBSERVED_GEOMETRY_ELEMENTS) {
      if (!hasWarnedAboutObservationLimit) {
        hasWarnedAboutObservationLimit = true;
        console.warn(GEOMETRY_OBSERVATION_LIMIT_WARNING);
      }

      return null;
    }

    const remoteElementId = remoteId(element as Node);

    observedRemoteElementIds.add(remoteElementId);
    pendingObservationIds.add(remoteElementId);
    scheduleObservationFlush();

    return remoteElementId;
  };

  const getElementOwnership = (element: object): ElementGeometryOwnership => {
    const existingOwnership = elementOwnerships.get(element);

    if (isDefined(existingOwnership)) {
      return existingOwnership;
    }

    const ownership: ElementGeometryOwnership = {
      remoteElementId: null,
      readerCount: 0,
      hasDirectReader: false,
      hasScheduledRelease: false,
    };
    elementOwnerships.set(element, ownership);

    return ownership;
  };

  const isObservedRemoteElementId = (
    remoteElementId: string | null | undefined,
  ): remoteElementId is string =>
    isDefined(remoteElementId) && observedRemoteElementIds.has(remoteElementId);

  const hasRemainingReader = (ownership: ElementGeometryOwnership): boolean =>
    ownership.hasDirectReader || ownership.readerCount > 0;

  const isDocumentScopedElement = (element: object): boolean =>
    isDefined(rootElement) &&
    (element === rootElement ||
      element === (rootElement as NodeLike).parentNode);

  const readDocumentScopedSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null =>
    isDefined(viewportSnapshot)
      ? createDocumentScopedElementGeometrySnapshot({
          viewport: viewportSnapshot,
          isDocumentElement: element !== rootElement,
        })
      : null;

  const resolveSnapshot = ({
    element,
    ownership,
  }: {
    element: object;
    ownership: ElementGeometryOwnership;
  }): ElementGeometrySnapshot | null => {
    if (isDocumentScopedElement(element)) {
      return readDocumentScopedSnapshot(element);
    }

    const enrolledRemoteElementId = ownership.remoteElementId;

    if (isObservedRemoteElementId(enrolledRemoteElementId)) {
      return elementSnapshots.get(enrolledRemoteElementId) ?? null;
    }

    if (
      !isElementUnderRemoteRoot(element, rootElement) ||
      !isHostRenderedElement(element)
    ) {
      return null;
    }

    const remoteElementId = enrollElement(element);
    ownership.remoteElementId = remoteElementId;

    if (!isDefined(remoteElementId)) {
      return null;
    }

    return elementSnapshots.get(remoteElementId) ?? null;
  };

  const resolveElementSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null => {
    const ownership = getElementOwnership(element);
    const snapshot = resolveSnapshot({ element, ownership });

    if (isDefined(ownership.remoteElementId)) {
      ownership.hasDirectReader = true;
    }

    return snapshot;
  };

  const readObservedElementSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null => {
    if (isDocumentScopedElement(element)) {
      return readDocumentScopedSnapshot(element);
    }

    const remoteElementId = elementOwnerships.get(element)?.remoteElementId;

    return isObservedRemoteElementId(remoteElementId)
      ? (elementSnapshots.get(remoteElementId) ?? null)
      : null;
  };

  const isElementMeasured = (element: object): boolean =>
    isObservedRemoteElementId(elementOwnerships.get(element)?.remoteElementId);

  const releaseElementGeometryWhenUnused = (
    ownership: ElementGeometryOwnership,
  ): void => {
    ownership.hasScheduledRelease = false;
    const remoteElementId = ownership.remoteElementId;

    if (hasRemainingReader(ownership) || !isDefined(remoteElementId)) {
      return;
    }

    ownership.remoteElementId = null;
    elementSnapshots.delete(remoteElementId);
    const wasPending = pendingObservationIds.delete(remoteElementId);
    const wasAtObservationLimit =
      observedRemoteElementIds.size >= MAX_OBSERVED_GEOMETRY_ELEMENTS;
    const wasObserved = observedRemoteElementIds.delete(remoteElementId);

    if (wasObserved && wasAtObservationLimit) {
      scheduleGeometryUpdateNotification();
    }

    if (wasPending || !wasObserved || !isDefined(transport)) {
      return;
    }

    transport
      .unobserveElementGeometry([remoteElementId])
      .catch(warnAboutTransportFailure);
  };

  const createElementGeometryReader = (
    element: object,
  ): ElementGeometryReader => {
    const ownership = getElementOwnership(element);
    const elementRef = new WeakRef(element);
    ownership.readerCount += 1;
    let isReleased = false;

    return {
      read: () => {
        const currentElement = elementRef.deref();

        if (isReleased || !isDefined(currentElement)) {
          return null;
        }

        return resolveSnapshot({ element: currentElement, ownership });
      },
      release: () => {
        if (isReleased) {
          return;
        }

        isReleased = true;
        ownership.readerCount -= 1;
        const remoteElementId = ownership.remoteElementId;

        if (hasRemainingReader(ownership) || !isDefined(remoteElementId)) {
          return;
        }

        if (pendingObservationIds.has(remoteElementId)) {
          releaseElementGeometryWhenUnused(ownership);
          return;
        }

        if (ownership.hasScheduledRelease) {
          return;
        }

        ownership.hasScheduledRelease = true;
        queueMicrotask(() => releaseElementGeometryWhenUnused(ownership));
      },
    };
  };

  const applyGeometryBatch = (batch: GeometryUpdateBatch): void => {
    if (isDefined(batch.viewport)) {
      viewportSnapshot = restoreUnchangedComputedStyle({
        previousSnapshot: viewportSnapshot,
        nextSnapshot: batch.viewport,
      });
    }

    if (isDefined(batch.elements)) {
      for (const [remoteElementId, snapshot] of Object.entries(
        batch.elements,
      )) {
        if (observedRemoteElementIds.has(remoteElementId)) {
          elementSnapshots.set(
            remoteElementId,
            restoreUnchangedComputedStyle({
              previousSnapshot: elementSnapshots.get(remoteElementId),
              nextSnapshot: snapshot,
            }),
          );
        }
      }
    }

    if (isDefined(batch.removedRemoteElementIds)) {
      const prunedObservedRemoteElementIds: string[] = [];

      for (const remoteElementId of batch.removedRemoteElementIds) {
        elementSnapshots.delete(remoteElementId);
        pendingObservationIds.delete(remoteElementId);

        if (observedRemoteElementIds.delete(remoteElementId)) {
          prunedObservedRemoteElementIds.push(remoteElementId);
        }
      }

      if (prunedObservedRemoteElementIds.length > 0 && isDefined(transport)) {
        transport
          .unobserveElementGeometry(prunedObservedRemoteElementIds)
          .catch(warnAboutTransportFailure);
      }
    }

    notifyGeometryUpdateListeners();
  };

  return {
    setRootElement: (nextRootElement: object) => {
      rootElement = nextRootElement;
    },
    connectTransport: (nextTransport: GeometryObservationTransport) => {
      transport = nextTransport;
      flushPendingObservations();
    },
    applyGeometryBatch,
    getViewportSnapshot: () => viewportSnapshot,
    subscribeToGeometryUpdates: (listener: () => void) => {
      geometryUpdateListeners.add(listener);

      return () => {
        geometryUpdateListeners.delete(listener);
      };
    },
    resolveElementSnapshot,
    readObservedElementSnapshot,
    isElementMeasured,
    createElementGeometryReader,
  };
};
