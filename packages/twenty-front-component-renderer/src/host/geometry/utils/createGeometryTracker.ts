import { findRemoteElementIdContainingNode } from '@/host/geometry/utils/findRemoteElementIdContainingNode';
import { isDefined } from 'twenty-shared/utils';

import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/geometry/constants/GeometryIdleFrameThreshold';
import { GEOMETRY_IDLE_PORTAL_CHECK_INTERVAL_MS } from '@/host/geometry/constants/GeometryIdlePortalCheckIntervalMs';
import { GEOMETRY_UNREGISTERED_OBSERVATION_EXPIRY_FRAMES } from '@/host/geometry/constants/GeometryUnregisteredObservationExpiryFrames';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type PushGeometryUpdates } from '@/host/geometry/types/PushGeometryUpdates';
import { createGeometryWakeSources } from '@/host/geometry/utils/createGeometryWakeSources';
import { isFrontComponentPortalOwnerInert } from '@/host/geometry/utils/isFrontComponentPortalOwnerInert';
import { isGeometrySnapshotEqualWithinEpsilon } from '@/host/geometry/utils/isGeometrySnapshotEqualWithinEpsilon';
import { measureNodeGeometry } from '@/host/geometry/utils/measureNodeGeometry';
import { measureViewportGeometry } from '@/host/geometry/utils/measureViewportGeometry';
import { updateFrontComponentPortalLayer } from '@/host/geometry/utils/updateFrontComponentPortalLayer';
import { sanitizeRemoteElementIds } from '@/host/geometry/utils/sanitizeRemoteElementIds';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createGeometryTracker = (): GeometryTracker => {
  const registeredNodes = new Map<string, Element>();
  const remoteElementIdByRegisteredNode = new WeakMap<object, string>();
  const observedRemoteElementIds = new Set<string>();
  const lastElementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const unregisteredObservedFrameCounts = new Map<string, number>();

  let rootContainer: Element | null = null;
  let portalLayer: HTMLElement | null = null;
  let pushGeometryUpdates: PushGeometryUpdates | null = null;
  let lastViewportSnapshot: ViewportGeometrySnapshot | null = null;
  let animationFrameHandle: number | null = null;
  let idlePortalCheckTimeout: ReturnType<typeof setTimeout> | null = null;
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

  const hasPortalOwnerChangedSinceLastFrame = (): boolean => {
    if (!isDefined(portalLayer) || !isDefined(rootContainer)) {
      return false;
    }

    const rootContainerRectangle = rootContainer.getBoundingClientRect();
    const lastRootContainerRectangle = isDefined(lastViewportSnapshot)
      ? {
          x: lastViewportSnapshot.rootContainerX,
          y: lastViewportSnapshot.rootContainerY,
          width: lastViewportSnapshot.rootContainerWidth,
          height: lastViewportSnapshot.rootContainerHeight,
        }
      : null;
    const hasRootContainerMoved = !isGeometrySnapshotEqualWithinEpsilon(
      lastRootContainerRectangle,
      {
        x: rootContainerRectangle.x,
        y: rootContainerRectangle.y,
        width: rootContainerRectangle.width,
        height: rootContainerRectangle.height,
      },
    );

    return (
      hasRootContainerMoved ||
      portalLayer.inert !== isFrontComponentPortalOwnerInert(rootContainer)
    );
  };

  const scheduleIdlePortalCheck = (): void => {
    if (isDefined(idlePortalCheckTimeout)) {
      return;
    }

    idlePortalCheckTimeout = setTimeout(() => {
      idlePortalCheckTimeout = null;

      if (hasPortalOwnerChangedSinceLastFrame()) {
        wake();
        return;
      }

      scheduleIdlePortalCheck();
    }, GEOMETRY_IDLE_PORTAL_CHECK_INTERVAL_MS);
  };

  const cancelIdlePortalCheck = (): void => {
    if (!isDefined(idlePortalCheckTimeout)) {
      return;
    }

    clearTimeout(idlePortalCheckTimeout);
    idlePortalCheckTimeout = null;
  };

  const wake = (): void => {
    idleFrameCount = 0;
    scheduleAnimationFrame();
  };

  const wakeSources = createGeometryWakeSources(wake);

  const detachElementSourcesWhenUnused = (): void => {
    if (observedRemoteElementIds.size > 0 || isDefined(portalLayer)) {
      return;
    }

    wakeSources.detachElementSources();
  };

  const readViewportGeometry = (): ViewportGeometrySnapshot =>
    measureViewportGeometry(rootContainer);

  const runFrame = (): void => {
    if (!isDefined(pushGeometryUpdates)) {
      return;
    }

    const viewport = readViewportGeometry();

    if (isDefined(portalLayer)) {
      updateFrontComponentPortalLayer({ portalLayer, rootContainer, viewport });
    }

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

    if (expiredRemoteElementIds.length > 0) {
      detachElementSourcesWhenUnused();
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
      return;
    }

    if (isDefined(portalLayer)) {
      scheduleIdlePortalCheck();
    }
  };

  const registerNode = (remoteElementId: string, node: Element): void => {
    const previousNode = registeredNodes.get(remoteElementId);

    if (isDefined(previousNode) && previousNode !== node) {
      wakeSources.stopObservingNode(previousNode);
      remoteElementIdByRegisteredNode.delete(previousNode);
    }

    registeredNodes.set(remoteElementId, node);
    remoteElementIdByRegisteredNode.set(node, remoteElementId);
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
    remoteElementIdByRegisteredNode.delete(node);
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

    detachElementSourcesWhenUnused();
  };

  const setRoot = (node: Element | null): void => {
    rootContainer = node;
    wakeSources.setRoot(node);
  };

  const setPortalLayer = (element: HTMLElement | null): void => {
    portalLayer = element;
    wakeSources.setPortalLayer(element);

    if (!isDefined(element)) {
      cancelIdlePortalCheck();
      detachElementSourcesWhenUnused();
      return;
    }

    wakeSources.attachElementSources();
    updateFrontComponentPortalLayer({
      portalLayer: element,
      rootContainer,
      viewport: readViewportGeometry(),
    });
    wake();
  };

  const setPushGeometryUpdates = (
    nextPushGeometryUpdates: PushGeometryUpdates | null,
  ): void => {
    pushGeometryUpdates = nextPushGeometryUpdates;

    if (!isDefined(nextPushGeometryUpdates)) {
      return;
    }

    wakeSources.attachViewportSources();

    if (isDefined(portalLayer)) {
      wakeSources.attachElementSources();
    }

    if (observedRemoteElementIds.size > 0 || isDefined(portalLayer)) {
      wake();
    }
  };

  const reset = (): void => {
    pushGeometryUpdates = null;

    if (isDefined(animationFrameHandle)) {
      cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = null;
    }

    cancelIdlePortalCheck();
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
    getRegisteredNode: (remoteElementId) =>
      registeredNodes.get(remoteElementId),
    findRemoteElementIdContainingNode: (node) =>
      findRemoteElementIdContainingNode({
        node,
        remoteElementIdByRegisteredNode,
      }),
    observe,
    unobserve,
    setRoot,
    setPortalLayer,
    setPushGeometryUpdates,
    getViewportGeometry: readViewportGeometry,
    reset,
  };
};
