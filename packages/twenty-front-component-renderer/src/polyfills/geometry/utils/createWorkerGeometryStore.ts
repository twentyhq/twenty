import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createWorkerGeometryStore = (): WorkerGeometryStore => {
  const elementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const enrolledRemoteElementIds = new WeakMap<object, string>();
  const observedRemoteElementIds = new Set<string>();
  const pendingObservationIds = new Set<string>();

  let rootElement: object | null = null;
  let transport: GeometryObservationTransport | null = null;
  let viewportSnapshot: ViewportGeometrySnapshot | null = null;
  let hasScheduledObservationFlush = false;
  let hasWarnedAboutObservationLimit = false;
  let hasWarnedAboutTransportFailure = false;

  const warnAboutTransportFailure = (): void => {
    if (hasWarnedAboutTransportFailure) {
      return;
    }

    hasWarnedAboutTransportFailure = true;
    console.warn(GEOMETRY_TRANSPORT_FAILURE_WARNING);
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

    enrolledRemoteElementIds.set(element, remoteElementId);
    observedRemoteElementIds.add(remoteElementId);
    pendingObservationIds.add(remoteElementId);
    scheduleObservationFlush();

    return remoteElementId;
  };

  const resolveElementSnapshot = (
    element: object,
  ): ElementGeometrySnapshot | null => {
    const enrolledRemoteElementId = enrolledRemoteElementIds.get(element);

    if (isDefined(enrolledRemoteElementId)) {
      if (observedRemoteElementIds.has(enrolledRemoteElementId)) {
        return elementSnapshots.get(enrolledRemoteElementId) ?? null;
      }

      enrolledRemoteElementIds.delete(element);
    }

    if (!isElementUnderRemoteRoot(element, rootElement)) {
      return null;
    }

    const remoteElementId = enrollElement(element);

    if (!isDefined(remoteElementId)) {
      return null;
    }

    return elementSnapshots.get(remoteElementId) ?? null;
  };

  const applyGeometryBatch = (batch: GeometryUpdateBatch): void => {
    if (isDefined(batch.viewport)) {
      viewportSnapshot = batch.viewport;
    }

    if (isDefined(batch.elements)) {
      for (const [remoteElementId, snapshot] of Object.entries(
        batch.elements,
      )) {
        elementSnapshots.set(remoteElementId, snapshot);
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
    resolveElementSnapshot,
  };
};
