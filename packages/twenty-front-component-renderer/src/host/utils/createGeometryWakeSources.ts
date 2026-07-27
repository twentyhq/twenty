import { isDefined } from 'twenty-shared/utils';

import { type GeometryWakeSources } from '@/host/types/GeometryWakeSources';

const ANIMATION_EVENT_TYPES = [
  'transitionrun',
  'transitionend',
  'transitioncancel',
  'animationstart',
  'animationend',
  'animationcancel',
];

const MUTATION_OBSERVER_OPTIONS: MutationObserverInit = {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
};

export const createGeometryWakeSources = (
  onWake: () => void,
): GeometryWakeSources => {
  const resizeObservedNodes = new Set<Element>();

  let rootContainer: Element | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let documentStyleObserver: MutationObserver | null = null;
  let areViewportSourcesAttached = false;
  let areElementSourcesAttached = false;

  const isEventTargetRelevantToRoot = (target: EventTarget | null): boolean => {
    if (!isDefined(rootContainer)) {
      return false;
    }

    if (!(target instanceof Node)) {
      return false;
    }

    return rootContainer.contains(target) || target.contains(rootContainer);
  };

  const handleAnimationEvent = (event: Event): void => {
    if (!isEventTargetRelevantToRoot(event.target)) {
      return;
    }

    onWake();
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

    resizeObserver = new ResizeObserver(onWake);

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

    documentStyleObserver = new MutationObserver(onWake);
    documentStyleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    documentStyleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  };

  const attachViewportSources = (): void => {
    if (areViewportSourcesAttached) {
      return;
    }

    areViewportSourcesAttached = true;

    window.addEventListener('resize', onWake);
    observeDocumentStyleMutations();

    if (isDefined(rootContainer)) {
      resolveResizeObserver()?.observe(rootContainer);
    }
  };

  const attachElementSources = (): void => {
    if (areElementSourcesAttached) {
      return;
    }

    areElementSourcesAttached = true;

    document.addEventListener('scroll', handleScroll, true);

    for (const eventType of ANIMATION_EVENT_TYPES) {
      document.addEventListener(eventType, handleAnimationEvent, true);
    }

    if (isDefined(rootContainer)) {
      observeRootMutations(rootContainer);
    }
  };

  const detachElementSources = (): void => {
    if (!areElementSourcesAttached) {
      return;
    }

    areElementSourcesAttached = false;

    document.removeEventListener('scroll', handleScroll, true);

    for (const eventType of ANIMATION_EVENT_TYPES) {
      document.removeEventListener(eventType, handleAnimationEvent, true);
    }

    mutationObserver?.disconnect();
    mutationObserver = null;

    for (const node of resizeObservedNodes) {
      resizeObserver?.unobserve(node);
    }
    resizeObservedNodes.clear();
  };

  const detachAllSources = (): void => {
    detachElementSources();

    if (areViewportSourcesAttached) {
      areViewportSourcesAttached = false;
      window.removeEventListener('resize', onWake);
      documentStyleObserver?.disconnect();
      documentStyleObserver = null;
    }

    resizeObserver?.disconnect();
    resizeObserver = null;
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
  };
};
