import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type GeometryWakeSources } from '@/host/types/GeometryWakeSources';

const ANIMATION_START_EVENT_TYPES = ['transitionrun', 'animationstart'];
const ANIMATION_END_EVENT_TYPES = [
  'transitionend',
  'transitioncancel',
  'animationend',
  'animationcancel',
];

const MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
};

const resolveAnimationIdentity = (event: Event): string => {
  const transitionProperty = (event as TransitionEvent).propertyName;

  if (isNonEmptyString(transitionProperty)) {
    return `transition:${transitionProperty}`;
  }

  const animationName = (event as AnimationEvent).animationName;

  if (isNonEmptyString(animationName)) {
    return `animation:${animationName}`;
  }

  return '';
};

export const createGeometryWakeSources = (
  onWake: () => void,
): GeometryWakeSources => {
  const resizeObservedNodes = new Set<Element>();
  const activeAnimationIdentitiesByTarget = new Map<Element, Set<string>>();

  let rootContainer: Element | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let documentStyleObserver: MutationObserver | null = null;
  let viewportDirty = false;
  let areViewportSourcesAttached = false;
  let areElementSourcesAttached = false;

  const wakeForViewport = (): void => {
    viewportDirty = true;
    onWake();
  };

  const handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      wakeForViewport();
    }
  };

  const isEventTargetRelevantToRoot = (target: EventTarget | null): boolean => {
    if (!isDefined(rootContainer)) {
      return false;
    }

    if (!(target instanceof Node)) {
      return false;
    }

    return rootContainer.contains(target) || target.contains(rootContainer);
  };

  const handleAnimationStart = (event: Event): void => {
    if (
      !isEventTargetRelevantToRoot(event.target) ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const activeIdentities =
      activeAnimationIdentitiesByTarget.get(event.target) ?? new Set<string>();
    activeIdentities.add(resolveAnimationIdentity(event));
    activeAnimationIdentitiesByTarget.set(event.target, activeIdentities);

    onWake();
  };

  // The end event is intentionally not filtered against the root: it clears the
  // matching started animation by identity, so a node reparented outside the
  // root between start and end still resolves, and an end for an animation that
  // was never tracked (started outside the root) is a no-op.
  const handleAnimationEnd = (event: Event): void => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const activeIdentities = activeAnimationIdentitiesByTarget.get(
      event.target,
    );

    if (!isDefined(activeIdentities)) {
      return;
    }

    activeIdentities.delete(resolveAnimationIdentity(event));

    if (activeIdentities.size === 0) {
      activeAnimationIdentitiesByTarget.delete(event.target);
    }
  };

  // A node removed mid-animation never delivers its end event; pruning
  // disconnected targets here releases them without a time cap, so genuinely
  // long-running animations on connected nodes keep the loop scheduling.
  const hasAnimationInFlight = (): boolean => {
    for (const [
      target,
      activeIdentities,
    ] of activeAnimationIdentitiesByTarget) {
      if (!target.isConnected || activeIdentities.size === 0) {
        activeAnimationIdentitiesByTarget.delete(target);
        continue;
      }

      return true;
    }

    return false;
  };

  const handleScroll = (event: Event): void => {
    if (
      event.target !== document &&
      !isEventTargetRelevantToRoot(event.target)
    ) {
      return;
    }

    onWake();
  };

  const resolveResizeObserver = (): ResizeObserver | null => {
    if (isDefined(resizeObserver) || typeof ResizeObserver !== 'function') {
      return resizeObserver;
    }

    resizeObserver = new ResizeObserver(wakeForViewport);

    return resizeObserver;
  };

  const observeRootMutations = (node: Element): void => {
    if (typeof MutationObserver !== 'function') {
      return;
    }

    mutationObserver = new MutationObserver(onWake);
    mutationObserver.observe(node, MUTATION_OBSERVER_OPTIONS);
  };

  const startObservingNode = (node: Element): void => {
    if (!areElementSourcesAttached || resizeObservedNodes.has(node)) {
      return;
    }

    const observer = resolveResizeObserver();

    if (!isDefined(observer)) {
      return;
    }

    observer.observe(node);
    resizeObservedNodes.add(node);
  };

  const stopObservingNode = (node: Element): void => {
    if (!resizeObservedNodes.delete(node)) {
      return;
    }

    resizeObserver?.unobserve(node);
  };

  const observeDocumentStyleMutations = (): void => {
    if (typeof MutationObserver !== 'function') {
      return;
    }

    documentStyleObserver = new MutationObserver(wakeForViewport);
    documentStyleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    documentStyleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    documentStyleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const attachViewportSources = (): boolean => {
    if (areViewportSourcesAttached) {
      return false;
    }

    areViewportSourcesAttached = true;

    window.addEventListener('resize', wakeForViewport);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    observeDocumentStyleMutations();

    if (isDefined(rootContainer)) {
      resolveResizeObserver()?.observe(rootContainer);
    }

    return true;
  };

  const attachElementSources = (): boolean => {
    if (areElementSourcesAttached) {
      return false;
    }

    areElementSourcesAttached = true;

    document.addEventListener('scroll', handleScroll, true);

    for (const eventType of ANIMATION_START_EVENT_TYPES) {
      document.addEventListener(eventType, handleAnimationStart, true);
    }

    for (const eventType of ANIMATION_END_EVENT_TYPES) {
      document.addEventListener(eventType, handleAnimationEnd, true);
    }

    if (isDefined(rootContainer)) {
      observeRootMutations(rootContainer);
    }

    return true;
  };

  const detachElementSources = (): void => {
    if (!areElementSourcesAttached) {
      return;
    }

    areElementSourcesAttached = false;

    document.removeEventListener('scroll', handleScroll, true);

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

    activeAnimationIdentitiesByTarget.clear();
  };

  const detachAllSources = (): void => {
    detachElementSources();

    if (areViewportSourcesAttached) {
      areViewportSourcesAttached = false;
      window.removeEventListener('resize', wakeForViewport);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      documentStyleObserver?.disconnect();
      documentStyleObserver = null;
    }

    resizeObserver?.disconnect();
    resizeObserver = null;
    viewportDirty = false;
  };

  const setRoot = (node: Element | null): void => {
    if (isDefined(rootContainer)) {
      resizeObserver?.unobserve(rootContainer);
    }

    mutationObserver?.disconnect();
    mutationObserver = null;

    rootContainer = node;

    if (!isDefined(node)) {
      return;
    }

    if (areViewportSourcesAttached) {
      resolveResizeObserver()?.observe(node);
    }

    if (areElementSourcesAttached) {
      observeRootMutations(node);
    }
  };

  return {
    attachViewportSources,
    attachElementSources,
    detachElementSources,
    detachAllSources,
    setRoot,
    startObservingNode,
    stopObservingNode,
    hasAnimationInFlight,
    isViewportDirty: () => viewportDirty,
    clearViewportDirty: () => {
      viewportDirty = false;
    },
  };
};
