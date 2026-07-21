import { isDefined } from 'twenty-shared/utils';

import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/constants/GeometryIdleFrameThreshold';
import { MAX_MEASURED_GEOMETRY_ELEMENTS } from '@/host/constants/MaxMeasuredGeometryElements';
import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/host/constants/MaxObservedGeometryElements';
import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { type PushGeometryUpdates } from '@/host/types/PushGeometryUpdates';
import { isElementGeometryEqualWithinEpsilon } from '@/host/utils/isElementGeometryEqualWithinEpsilon';
import { isViewportGeometryEqualWithinEpsilon } from '@/host/utils/isViewportGeometryEqualWithinEpsilon';
import { measureNodeGeometry } from '@/host/utils/measureNodeGeometry';
import { measureViewportGeometry } from '@/host/utils/measureViewportGeometry';
import { sanitizeRemoteElementIds } from '@/host/utils/sanitizeRemoteElementIds';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const ANIMATION_START_EVENT_TYPES = ['transitionrun', 'animationstart'];
const ANIMATION_END_EVENT_TYPES = [
  'transitionend',
  'transitioncancel',
  'animationend',
  'animationcancel',
];

export const createGeometryTracker = (): GeometryTracker => {
  const registeredNodes = new Map<string, Element>();
  const observedRemoteElementIds = new Set<string>();
  const lastElementSnapshots = new Map<string, ElementGeometrySnapshot>();
  const resizeObservedNodes = new Set<Element>();

  let rootContainer: Element | null = null;
  let pushGeometryUpdates: PushGeometryUpdates | null = null;
  let lastViewportSnapshot: ViewportGeometrySnapshot | null = null;
  let animationFrameHandle: number | null = null;
  let idleFrameCount = 0;
  let isViewportDirty = false;
  let animationInFlightCount = 0;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let areViewportWakeSourcesAttached = false;
  let areElementWakeSourcesAttached = false;

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

  const handleWindowResize = (): void => {
    isViewportDirty = true;
    wake();
  };

  const handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      wake();
    }
  };

  const handleAnimationStart = (): void => {
    animationInFlightCount += 1;
    wake();
  };

  const handleAnimationEnd = (): void => {
    animationInFlightCount = Math.max(0, animationInFlightCount - 1);
  };

  const createResizeObserver = (): ResizeObserver | null => {
    if (typeof ResizeObserver !== 'function') {
      return null;
    }

    return new ResizeObserver(() => {
      isViewportDirty = true;
      wake();
    });
  };

  const startObservingNodeResize = (node: Element): void => {
    if (!areElementWakeSourcesAttached || resizeObservedNodes.has(node)) {
      return;
    }

    resizeObserver = resizeObserver ?? createResizeObserver();

    if (!isDefined(resizeObserver)) {
      return;
    }

    resizeObserver.observe(node);
    resizeObservedNodes.add(node);
  };

  const stopObservingNodeResize = (node: Element): void => {
    if (!resizeObservedNodes.delete(node)) {
      return;
    }

    resizeObserver?.unobserve(node);
  };

  const attachViewportWakeSources = (): void => {
    if (areViewportWakeSourcesAttached) {
      return;
    }

    areViewportWakeSourcesAttached = true;

    window.addEventListener('resize', handleWindowResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeObserver = resizeObserver ?? createResizeObserver();

    if (isDefined(rootContainer) && isDefined(resizeObserver)) {
      resizeObserver.observe(rootContainer);
    }
  };

  const attachElementWakeSources = (): void => {
    if (areElementWakeSourcesAttached) {
      return;
    }

    areElementWakeSourcesAttached = true;

    document.addEventListener('scroll', wake, true);

    for (const eventType of ANIMATION_START_EVENT_TYPES) {
      document.addEventListener(eventType, handleAnimationStart, true);
    }

    for (const eventType of ANIMATION_END_EVENT_TYPES) {
      document.addEventListener(eventType, handleAnimationEnd, true);
    }

    if (typeof MutationObserver === 'function' && isDefined(rootContainer)) {
      mutationObserver = new MutationObserver(wake);
      mutationObserver.observe(rootContainer, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
    }

    for (const remoteElementId of observedRemoteElementIds) {
      const node = registeredNodes.get(remoteElementId);

      if (isDefined(node)) {
        startObservingNodeResize(node);
      }
    }
  };

  const detachElementWakeSources = (): void => {
    if (!areElementWakeSourcesAttached) {
      return;
    }

    areElementWakeSourcesAttached = false;

    document.removeEventListener('scroll', wake, true);

    for (const eventType of ANIMATION_START_EVENT_TYPES) {
      document.removeEventListener(eventType, handleAnimationStart, true);
    }

    for (const eventType of ANIMATION_END_EVENT_TYPES) {
      document.removeEventListener(eventType, handleAnimationEnd, true);
    }

    mutationObserver?.disconnect();
    mutationObserver = null;

    for (const node of resizeObservedNodes) {
      resizeObserver?.unobserve(node);
    }
    resizeObservedNodes.clear();

    animationInFlightCount = 0;
  };

  const runFrame = (): void => {
    if (!isDefined(pushGeometryUpdates)) {
      return;
    }

    if (document.visibilityState !== 'visible') {
      return;
    }

    if (observedRemoteElementIds.size === 0 && !isViewportDirty) {
      return;
    }

    const changedElements: Record<string, ElementGeometrySnapshot> = {};
    const removedRemoteElementIds: string[] = [];

    for (const remoteElementId of observedRemoteElementIds) {
      const node = registeredNodes.get(remoteElementId);

      if (!isDefined(node) || !node.isConnected) {
        if (lastElementSnapshots.delete(remoteElementId)) {
          removedRemoteElementIds.push(remoteElementId);
        }
        continue;
      }

      const snapshot = measureNodeGeometry(node);

      if (
        !isElementGeometryEqualWithinEpsilon(
          lastElementSnapshots.get(remoteElementId),
          snapshot,
        )
      ) {
        lastElementSnapshots.set(remoteElementId, snapshot);
        changedElements[remoteElementId] = snapshot;
      }
    }

    const viewport = measureViewportGeometry(rootContainer);
    const hasViewportChanged = !isViewportGeometryEqualWithinEpsilon(
      lastViewportSnapshot,
      viewport,
    );

    lastViewportSnapshot = viewport;
    isViewportDirty = false;

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

    if (
      idleFrameCount < GEOMETRY_IDLE_FRAME_THRESHOLD ||
      animationInFlightCount > 0
    ) {
      scheduleAnimationFrame();
    }
  };

  const registerNode = (remoteElementId: string, node: Element): void => {
    registeredNodes.set(remoteElementId, node);

    if (observedRemoteElementIds.has(remoteElementId)) {
      startObservingNodeResize(node);
      wake();
    }
  };

  const unregisterNode = (remoteElementId: string, node: Element): void => {
    if (registeredNodes.get(remoteElementId) !== node) {
      return;
    }

    registeredNodes.delete(remoteElementId);
    stopObservingNodeResize(node);

    if (observedRemoteElementIds.has(remoteElementId)) {
      wake();
    }
  };

  const observe = (remoteElementIds: unknown): void => {
    if (!isDefined(pushGeometryUpdates)) {
      return;
    }

    for (const remoteElementId of sanitizeRemoteElementIds(remoteElementIds)) {
      if (observedRemoteElementIds.size >= MAX_OBSERVED_GEOMETRY_ELEMENTS) {
        break;
      }

      observedRemoteElementIds.add(remoteElementId);

      const node = registeredNodes.get(remoteElementId);

      if (isDefined(node)) {
        startObservingNodeResize(node);
      }
    }

    if (observedRemoteElementIds.size > 0) {
      attachElementWakeSources();
    }

    wake();
  };

  const unobserve = (remoteElementIds: unknown): void => {
    for (const remoteElementId of sanitizeRemoteElementIds(remoteElementIds)) {
      observedRemoteElementIds.delete(remoteElementId);
      lastElementSnapshots.delete(remoteElementId);

      const node = registeredNodes.get(remoteElementId);

      if (isDefined(node)) {
        stopObservingNodeResize(node);
      }
    }

    if (observedRemoteElementIds.size === 0) {
      detachElementWakeSources();
    }
  };

  const measure = (remoteElementIds: unknown) => {
    const viewport = measureViewportGeometry(rootContainer);
    const elements: Record<string, ElementGeometrySnapshot> = {};

    if (!isDefined(pushGeometryUpdates)) {
      return { viewport, elements };
    }

    for (const remoteElementId of sanitizeRemoteElementIds(
      remoteElementIds,
      MAX_MEASURED_GEOMETRY_ELEMENTS,
    )) {
      const node = registeredNodes.get(remoteElementId);

      if (!isDefined(node) || !node.isConnected) {
        continue;
      }

      const snapshot = measureNodeGeometry(node);
      elements[remoteElementId] = snapshot;

      if (observedRemoteElementIds.has(remoteElementId)) {
        lastElementSnapshots.set(remoteElementId, snapshot);
      }
    }

    lastViewportSnapshot = viewport;
    wake();

    return { viewport, elements };
  };

  const setRoot = (node: Element | null): void => {
    if (isDefined(rootContainer) && isDefined(resizeObserver)) {
      resizeObserver.unobserve(rootContainer);
    }

    mutationObserver?.disconnect();
    mutationObserver = null;

    rootContainer = node;

    if (!isDefined(node)) {
      return;
    }

    if (areViewportWakeSourcesAttached) {
      resizeObserver = resizeObserver ?? createResizeObserver();
      resizeObserver?.observe(node);
    }

    if (
      areElementWakeSourcesAttached &&
      typeof MutationObserver === 'function'
    ) {
      mutationObserver = new MutationObserver(wake);
      mutationObserver.observe(node, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
    }
  };

  const setPushGeometryUpdates = (
    nextPushGeometryUpdates: PushGeometryUpdates | null,
  ): void => {
    pushGeometryUpdates = nextPushGeometryUpdates;

    if (!isDefined(nextPushGeometryUpdates)) {
      return;
    }

    attachViewportWakeSources();
  };

  const getViewportGeometry = (): ViewportGeometrySnapshot =>
    measureViewportGeometry(rootContainer);

  const reset = (): void => {
    pushGeometryUpdates = null;

    if (isDefined(animationFrameHandle)) {
      cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = null;
    }

    detachElementWakeSources();

    if (areViewportWakeSourcesAttached) {
      areViewportWakeSourcesAttached = false;
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    resizeObserver?.disconnect();
    resizeObserver = null;

    observedRemoteElementIds.clear();
    lastElementSnapshots.clear();
    resizeObservedNodes.clear();
    lastViewportSnapshot = null;
    idleFrameCount = 0;
    isViewportDirty = false;
  };

  return {
    registerNode,
    unregisterNode,
    observe,
    unobserve,
    measure,
    setRoot,
    setPushGeometryUpdates,
    getViewportGeometry,
    reset,
  };
};
