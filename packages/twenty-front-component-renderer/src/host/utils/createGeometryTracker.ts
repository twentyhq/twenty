import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/constants/GeometryIdleFrameThreshold';
import { GEOMETRY_UNREGISTERED_OBSERVATION_EXPIRY_FRAMES } from '@/host/constants/GeometryUnregisteredObservationExpiryFrames';
import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { type PushGeometryUpdates } from '@/host/types/PushGeometryUpdates';
import { createGeometryWakeSources } from '@/host/utils/createGeometryWakeSources';
import { isGeometrySnapshotEqualWithinEpsilon } from '@/host/utils/isGeometrySnapshotEqualWithinEpsilon';
import { measureNodeGeometry } from '@/host/utils/measureNodeGeometry';
import { measureViewportGeometry } from '@/host/utils/measureViewportGeometry';
import { sanitizeRemoteElementIds } from '@/host/utils/sanitizeRemoteElementIds';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createGeometryTracker = (): GeometryTracker => {
  const registeredNodes = new Map<string, Element>();
  const observedRemoteElementIds = new Set<string>();
  const lastElementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const unregisteredObservedFrameCounts = new Map<string, number>();

  let rootContainer: Element | null = null;
  let pushGeometryUpdates: PushGeometryUpdates | null = null;
  let lastViewportSnapshot: ViewportGeometrySnapshot | null = null;
  let animationFrameHandle: number | null = null;
  let idleFrameCount = 0;

  const scheduleAnimationFrame = (): void => {
    if (isDefined(animationFrameHandle) || !isDefined(pushGeometryUpdates)) {
      return;
    }

    animationFrameHandle = requestAnimationFrame(() => {
      animationFrameHandle = null;
      runFrame();
    });
  };

  const wake = (): void => {
    idleFrameCount = 0;
    scheduleAnimationFrame();
  };

  const wakeSources = createGeometryWakeSources(wake);

  const readViewportGeometry = (): ViewportGeometrySnapshot =>
    measureViewportGeometry(rootContainer);

  const runFrame = (): void => {
    if (!isDefined(pushGeometryUpdates)) {
      return;
    }

    const viewport = readViewportGeometry();
    const rootContainerOrigin = {
      x: viewport.rootContainerX,
      y: viewport.rootContainerY,
    };

    const changedElements: Record<string, ElementGeometrySnapshot> = {};
    const removedRemoteElementIds: string[] = [];

    const expiredRemoteElementIds: string[] = [];

    for (const remoteElementId of observedRemoteElementIds) {
      const node = registeredNodes.get(remoteElementId);

      if (!isDefined(node) || !node.isConnected) {
        const unregisteredFrameCount =
          (unregisteredObservedFrameCounts.get(remoteElementId) ?? 0) + 1;
        unregisteredObservedFrameCounts.set(
          remoteElementId,
          unregisteredFrameCount,
        );

        const hadSnapshot = lastElementSnapshots.delete(remoteElementId);
        const hasExpired =
          unregisteredFrameCount >=
          GEOMETRY_UNREGISTERED_OBSERVATION_EXPIRY_FRAMES;

        if (hasExpired) {
          expiredRemoteElementIds.push(remoteElementId);
        }

        if (hadSnapshot || hasExpired) {
          removedRemoteElementIds.push(remoteElementId);
        }
        continue;
      }

      unregisteredObservedFrameCounts.delete(remoteElementId);

      const snapshot = measureNodeGeometry({ node, rootContainerOrigin });

      if (
        !isGeometrySnapshotEqualWithinEpsilon(
          lastElementSnapshots.get(remoteElementId),
          snapshot,
        )
      ) {
        lastElementSnapshots.set(remoteElementId, snapshot);
        changedElements[remoteElementId] = snapshot;
      }
    }

    for (const remoteElementId of expiredRemoteElementIds) {
      observedRemoteElementIds.delete(remoteElementId);
      unregisteredObservedFrameCounts.delete(remoteElementId);
    }

    if (
      expiredRemoteElementIds.length > 0 &&
      observedRemoteElementIds.size === 0
    ) {
      wakeSources.detachElementSources();
    }

    const hasViewportChanged = !isGeometrySnapshotEqualWithinEpsilon(
      lastViewportSnapshot,
      viewport,
    );

    lastViewportSnapshot = viewport;

    const hasChangedElements = Object.keys(changedElements).length > 0;

    if (
      hasViewportChanged ||
      hasChangedElements ||
      removedRemoteElementIds.length > 0
    ) {
      idleFrameCount = 0;
      pushGeometryUpdates({
        viewport,
        elements: changedElements,
        removedRemoteElementIds,
      });
    } else {
      idleFrameCount += 1;
    }

    if (idleFrameCount < GEOMETRY_IDLE_FRAME_THRESHOLD) {
      scheduleAnimationFrame();
    }
  };

  const registerNode = (remoteElementId: string, node: Element): void => {
    const previousNode = registeredNodes.get(remoteElementId);

    if (isDefined(previousNode) && previousNode !== node) {
      wakeSources.stopObservingNode(previousNode);
    }

    registeredNodes.set(remoteElementId, node);
    unregisteredObservedFrameCounts.delete(remoteElementId);

    if (observedRemoteElementIds.has(remoteElementId)) {
      wakeSources.startObservingNode(node);
      wake();
    }
  };

  const unregisterNode = (remoteElementId: string, node: Element): void => {
    if (registeredNodes.get(remoteElementId) !== node) {
      return;
    }

    registeredNodes.delete(remoteElementId);
    wakeSources.stopObservingNode(node);

    if (observedRemoteElementIds.has(remoteElementId)) {
      wake();
    }
  };

  const observe = (remoteElementIds: unknown): void => {
    let hasNewlyObservedRemoteElementIds = false;

    for (const remoteElementId of sanitizeRemoteElementIds(remoteElementIds)) {
      if (observedRemoteElementIds.size >= MAX_OBSERVED_GEOMETRY_ELEMENTS) {
        break;
      }

      if (observedRemoteElementIds.has(remoteElementId)) {
        continue;
      }

      observedRemoteElementIds.add(remoteElementId);
      hasNewlyObservedRemoteElementIds = true;
    }

    if (!hasNewlyObservedRemoteElementIds) {
      return;
    }

    wakeSources.attachElementSources();

    for (const remoteElementId of observedRemoteElementIds) {
      const node = registeredNodes.get(remoteElementId);

      if (isDefined(node)) {
        wakeSources.startObservingNode(node);
      }
    }

    wake();
  };

  const unobserve = (remoteElementIds: unknown): void => {
    for (const remoteElementId of sanitizeRemoteElementIds(remoteElementIds)) {
      observedRemoteElementIds.delete(remoteElementId);
      lastElementSnapshots.delete(remoteElementId);
      unregisteredObservedFrameCounts.delete(remoteElementId);

      const node = registeredNodes.get(remoteElementId);

      if (isDefined(node)) {
        wakeSources.stopObservingNode(node);
      }
    }

    if (observedRemoteElementIds.size === 0) {
      wakeSources.detachElementSources();
    }
  };

  const setRoot = (node: Element | null): void => {
    rootContainer = node;
    wakeSources.setRoot(node);
  };

  const setPushGeometryUpdates = (
    nextPushGeometryUpdates: PushGeometryUpdates | null,
  ): void => {
    pushGeometryUpdates = nextPushGeometryUpdates;

    if (!isDefined(nextPushGeometryUpdates)) {
      return;
    }

    wakeSources.attachViewportSources();

    if (observedRemoteElementIds.size > 0) {
      wake();
    }
  };

  const reset = (): void => {
    pushGeometryUpdates = null;

    if (isDefined(animationFrameHandle)) {
      cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = null;
    }

    wakeSources.detachAllSources();

    observedRemoteElementIds.clear();
    lastElementSnapshots.clear();
    unregisteredObservedFrameCounts.clear();
    lastViewportSnapshot = null;
    idleFrameCount = 0;
  };

  return {
    registerNode,
    unregisterNode,
    observe,
    unobserve,
    setRoot,
    setPushGeometryUpdates,
    getViewportGeometry: readViewportGeometry,
    reset,
  };
};
