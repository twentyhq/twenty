import { type Hooks } from '@remote-dom/polyfill';
import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createResizeObserverEntry } from '@/polyfills/geometry/utils/createResizeObserverEntry';

const DEFAULT_DEVICE_PIXEL_RATIO = 1;
const DEFAULT_OBSERVATION_BOX = 'content-box';

type Observation = {
  targetRef: WeakRef<Element>;
  box: ResizeObserverBoxOptions;
  lastSize: ResizeObserverSize | null;
  hasBeenConnected: boolean;
};

type CreateResizeObserverClassInput = {
  geometryStore: WorkerGeometryStore;
  hooks: Partial<Hooks> | null;
  reportCallbackError: (error: unknown) => void;
};

export const createResizeObserverClass = ({
  geometryStore,
  hooks,
  reportCallbackError,
}: CreateResizeObserverClassInput) => {
  const activeObserverSweeps = new Set<() => void>();
  const activeObserverSchedules = new Set<() => void>();
  let hasScheduledDetachedElementSweep = false;

  const sweepDetachedElements = () => {
    hasScheduledDetachedElementSweep = false;

    for (const sweepObserver of activeObserverSweeps) {
      sweepObserver();
    }
  };

  if (isDefined(hooks)) {
    const previousRemoveChildHook = hooks.removeChild;
    const previousInsertChildHook = hooks.insertChild;

    hooks.insertChild = (parent, node, index) => {
      previousInsertChildHook?.(parent, node, index);

      for (const scheduleObserverDelivery of activeObserverSchedules) {
        scheduleObserverDelivery();
      }
    };

    hooks.removeChild = (parent, node, index) => {
      previousRemoveChildHook?.(parent, node, index);

      if (hasScheduledDetachedElementSweep || activeObserverSweeps.size === 0) {
        return;
      }

      hasScheduledDetachedElementSweep = true;
      queueMicrotask(sweepDetachedElements);
    };
  }

  class ResizeObserverImplementation implements ResizeObserver {
    #callback: ResizeObserverCallback;
    #observations = new Map<WeakRef<Element>, Observation>();
    #targetRefs = new WeakMap<Element, WeakRef<Element>>();
    #unsubscribe: (() => void) | null = null;
    #hasScheduledDelivery = false;

    constructor(callback: ResizeObserverCallback) {
      if (!isFunction(callback)) {
        throw new TypeError('ResizeObserver requires a callback function.');
      }

      this.#callback = callback;
    }

    #stopWhenEmpty = () => {
      if (this.#observations.size > 0) {
        return;
      }

      this.#unsubscribe?.();
      this.#unsubscribe = null;
      activeObserverSweeps.delete(this.#pruneDetachedTargets);
      activeObserverSchedules.delete(this.#scheduleDelivery);
    };

    #pruneDetachedTargets = () => {
      for (const [targetRef, observation] of this.#observations) {
        const target = targetRef.deref();

        if (!isDefined(target)) {
          this.#observations.delete(targetRef);
          continue;
        }

        if (target.isConnected) {
          observation.hasBeenConnected = true;
          continue;
        }

        if (observation.hasBeenConnected) {
          this.#observations.delete(targetRef);
        }
      }

      this.#stopWhenEmpty();
    };

    #deliver = () => {
      this.#hasScheduledDelivery = false;
      this.#pruneDetachedTargets();

      const entries: ResizeObserverEntry[] = [];

      for (const observation of this.#observations.values()) {
        const target = observation.targetRef.deref();

        if (!isDefined(target) || !target.isConnected) {
          continue;
        }

        const snapshot = geometryStore.resolveElementSnapshot(target);

        if (!isDefined(snapshot)) {
          continue;
        }

        const entry = createResizeObserverEntry({
          target,
          snapshot,
          devicePixelRatio:
            geometryStore.getViewportSnapshot()?.devicePixelRatio ??
            DEFAULT_DEVICE_PIXEL_RATIO,
        });
        const boxSizes =
          observation.box === 'border-box'
            ? entry.borderBoxSize
            : observation.box === 'device-pixel-content-box'
              ? entry.devicePixelContentBoxSize
              : entry.contentBoxSize;
        const size = boxSizes[0];
        const hasSizeChanged =
          size.inlineSize !== observation.lastSize?.inlineSize ||
          size.blockSize !== observation.lastSize?.blockSize;

        if (!hasSizeChanged) {
          continue;
        }

        observation.lastSize = size;
        entries.push(entry);
      }

      if (entries.length === 0) {
        return;
      }

      try {
        this.#callback(entries, this);
      } catch (error) {
        reportCallbackError(error);
      }
    };

    #scheduleDelivery = () => {
      if (this.#hasScheduledDelivery || this.#observations.size === 0) {
        return;
      }

      this.#hasScheduledDelivery = true;
      queueMicrotask(this.#deliver);
    };

    observe(target: Element, options: ResizeObserverOptions = {}): void {
      if (target?.nodeType !== 1) {
        throw new TypeError('ResizeObserver requires an Element target.');
      }

      const box = options.box ?? DEFAULT_OBSERVATION_BOX;
      const isSupportedBox =
        box === 'content-box' ||
        box === 'border-box' ||
        box === 'device-pixel-content-box';

      if (!isSupportedBox) {
        throw new TypeError(
          'ResizeObserver received an unsupported box option.',
        );
      }

      const existingTargetRef = this.#targetRefs.get(target);
      const targetRef = existingTargetRef ?? new WeakRef(target);
      const existingObservation = this.#observations.get(targetRef);

      if (existingObservation?.box === box) {
        return;
      }

      this.#targetRefs.set(target, targetRef);
      this.#observations.set(targetRef, {
        targetRef,
        box,
        lastSize: null,
        hasBeenConnected: target.isConnected,
      });
      geometryStore.resolveElementSnapshot(target);
      activeObserverSweeps.add(this.#pruneDetachedTargets);
      activeObserverSchedules.add(this.#scheduleDelivery);
      this.#unsubscribe ??= geometryStore.subscribeToGeometryUpdates(
        this.#scheduleDelivery,
      );
      this.#scheduleDelivery();
    }

    unobserve(target: Element): void {
      const targetRef = this.#targetRefs.get(target);

      if (isDefined(targetRef)) {
        this.#observations.delete(targetRef);
      }

      this.#stopWhenEmpty();
    }

    disconnect(): void {
      this.#observations.clear();
      this.#stopWhenEmpty();
    }
  }

  return ResizeObserverImplementation;
};
