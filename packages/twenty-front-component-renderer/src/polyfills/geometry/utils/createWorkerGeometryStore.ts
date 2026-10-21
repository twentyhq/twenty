import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { type NodeLike } from '@/polyfills/dom/types/NodeLike';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createDocumentScopedElementGeometrySnapshot } from '@/polyfills/geometry/utils/createDocumentScopedElementGeometrySnapshot';
import { createElementGeometryOwnerships } from '@/polyfills/geometry/utils/createElementGeometryOwnerships';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { isHostRenderedElement } from '@/polyfills/geometry/utils/isHostRenderedElement';
import { restoreUnchangedComputedStyle } from '@/polyfills/geometry/utils/restoreUnchangedComputedStyle';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createWorkerGeometryStore = (): WorkerGeometryStore => {
  const elementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const observedRemoteElementIds = new Set<string>();
  const pendingObservationIds = new Set<string>();
  const geometryUpdateListeners = new Set<() => void>();

  let rootElement: NodeLike | null = null;
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

  const releaseRemoteElement = (remoteElementId: string): void => {
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

  const elementGeometryOwnerships = createElementGeometryOwnerships({
    isObservedRemoteElementId: (remoteElementId) =>
      observedRemoteElementIds.has(remoteElementId),
    isPendingObservation: (remoteElementId) =>
      pendingObservationIds.has(remoteElementId),
    releaseRemoteElement,
  });

  const isDocumentScopedElement = (element: object): boolean =>
    isDefined(rootElement) &&
    (element === rootElement || element === rootElement.parentNode);

  const readDocumentScopedSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null =>
    isDefined(viewportSnapshot)
      ? createDocumentScopedElementGeometrySnapshot({
          viewport: viewportSnapshot,
          isDocumentElement: element !== rootElement,
        })
      : null;

  const readElementSnapshot = (
    remoteElementId: string | null,
  ): ElementGeometrySnapshot | null =>
    isDefined(remoteElementId)
      ? (elementSnapshots.get(remoteElementId) ?? null)
      : null;

  const resolveSnapshot = (element: object): ElementGeometrySnapshot | null => {
    if (isDocumentScopedElement(element)) {
      return readDocumentScopedSnapshot(element);
    }

    const observedRemoteElementId =
      elementGeometryOwnerships.readObservedRemoteElementId(element);

    if (isDefined(observedRemoteElementId)) {
      return readElementSnapshot(observedRemoteElementId);
    }

    if (
      !isElementUnderRemoteRoot(element, rootElement) ||
      !isHostRenderedElement(element)
    ) {
      return null;
    }

    const remoteElementId = enrollElement(element);
    elementGeometryOwnerships.assignRemoteElementId({
      element,
      remoteElementId,
    });

    return readElementSnapshot(remoteElementId);
  };

  const resolveElementSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null => {
    const snapshot = resolveSnapshot(element);
    elementGeometryOwnerships.markDirectReader(element);

    return snapshot;
  };

  const readObservedElementSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null =>
    isDocumentScopedElement(element)
      ? readDocumentScopedSnapshot(element)
      : readElementSnapshot(
          elementGeometryOwnerships.readObservedRemoteElementId(element),
        );

  const isElementMeasured = (element: object): boolean =>
    isDefined(elementGeometryOwnerships.readObservedRemoteElementId(element));

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
    createElementGeometryReader: (element: object) =>
      elementGeometryOwnerships.createElementGeometryReader({
        element,
        readSnapshot: resolveSnapshot,
      }),
  };
};
