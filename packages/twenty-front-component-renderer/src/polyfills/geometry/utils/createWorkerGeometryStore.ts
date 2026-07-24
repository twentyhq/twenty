import { remoteId } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { GEOMETRY_OBSERVATION_LIMIT_WARNING } from '@/polyfills/geometry/constants/GeometryObservationLimitWarning';
import { type GeometryObservationTransport } from '@/polyfills/geometry/types/GeometryObservationTransport';
import { type MirroredElementState } from '@/polyfills/geometry/types/MirroredElementState';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createWorkerGeometryStore = (): WorkerGeometryStore => {
  const elementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const enrolledRemoteElementIds = new WeakMap<object, string>();
  const enrolledElementsByRemoteElementId = new Map<string, WeakRef<object>>();
  const observedRemoteElementIds = new Set<string>();
  const pendingObservationIds = new Set<string>();

  let rootElement: object | null = null;
  let transport: GeometryObservationTransport | null = null;
  let viewportSnapshot: ViewportGeometrySnapshot | null = null;
  let hasScheduledObservationFlush = false;
  let hasWarnedAboutObservationLimit = false;

  const flushPendingObservations = (): void => {
    hasScheduledObservationFlush = false;

    if (!isDefined(transport) || pendingObservationIds.size === 0) {
      return;
    }

    const remoteElementIds = [...pendingObservationIds];
    pendingObservationIds.clear();

    transport.observeElementGeometry(remoteElementIds).catch(() => {});
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
    enrolledElementsByRemoteElementId.set(
      remoteElementId,
      new WeakRef(element),
    );
    observedRemoteElementIds.add(remoteElementId);
    pendingObservationIds.add(remoteElementId);
    scheduleObservationFlush();

    return remoteElementId;
  };

  const resolveMirroredElementState = (
    element: object,
  ): MirroredElementState => {
    const enrolledRemoteElementId = enrolledRemoteElementIds.get(element);

    if (isDefined(enrolledRemoteElementId)) {
      if (observedRemoteElementIds.has(enrolledRemoteElementId)) {
        return {
          isMirrored: true,
          snapshot: elementSnapshots.get(enrolledRemoteElementId) ?? null,
        };
      }

      enrolledRemoteElementIds.delete(element);
    }

    if (!isElementUnderRemoteRoot(element, rootElement)) {
      return { isMirrored: false, snapshot: null };
    }

    const remoteElementId = enrollElement(element);

    if (!isDefined(remoteElementId)) {
      return { isMirrored: true, snapshot: null };
    }

    return {
      isMirrored: true,
      snapshot: elementSnapshots.get(remoteElementId) ?? null,
    };
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
        enrolledElementsByRemoteElementId.delete(remoteElementId);

        if (observedRemoteElementIds.delete(remoteElementId)) {
          prunedObservedRemoteElementIds.push(remoteElementId);
        }
      }

      if (prunedObservedRemoteElementIds.length > 0 && isDefined(transport)) {
        transport
          .unobserveElementGeometry(prunedObservedRemoteElementIds)
          .catch(() => {});
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
    resolveMirroredElementState,
    resolveElementByRemoteElementId: (remoteElementId: string) =>
      enrolledElementsByRemoteElementId.get(remoteElementId)?.deref() ?? null,
  };
};
