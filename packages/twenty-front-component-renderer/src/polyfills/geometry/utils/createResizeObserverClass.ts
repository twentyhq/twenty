import { type Hooks } from '@remote-dom/polyfill';
import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { EMPTY_ELEMENT_GEOMETRY_SNAPSHOT } from '@/polyfills/geometry/constants/EmptyElementGeometrySnapshot';
import { type ElementGeometryReader } from '@/polyfills/geometry/types/ElementGeometryReader';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createResizeObserverEntry } from '@/polyfills/geometry/utils/createResizeObserverEntry';
import { resolveResizeObserverBoxSize } from '@/polyfills/geometry/utils/resolveResizeObserverBoxSize';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const DEFAULT_DEVICE_PIXEL_RATIO = 1;
const DEFAULT_OBSERVATION_BOX = 'content-box';

type Observation = {
  box: ResizeObserverBoxOptions;
  lastSize: ResizeObserverSize | null;
  geometryReader: ElementGeometryReader | null;
};

type CreateResizeObserverClassInput = {
  geometryStore: WorkerGeometryStore;
  hooks: Partial<Hooks> | null;
  reportCallbackError: (error: unknown) => void;
};

const isVisibleSize = (size: ResizeObserverSize | null): boolean =>
  isDefined(size) && (size.inlineSize !== 0 || size.blockSize !== 0);

export const createResizeObserverClass = ({
  geometryStore,
  hooks,
  reportCallbackError,
}: CreateResizeObserverClassInput) => {
  const activeObserverSchedules = new Set<() => void>();

  const scheduleActiveObserverDeliveries = () => {
    for (const scheduleObserverDelivery of activeObserverSchedules) {
      scheduleObserverDelivery();
    }
  };

  if (isDefined(hooks)) {
    const previousInsertChildHook = hooks.insertChild;
    const previousRemoveChildHook = hooks.removeChild;

    hooks.insertChild = (parent, node, index) => {
      previousInsertChildHook?.(parent, node, index);
      scheduleActiveObserverDeliveries();
    };

    hooks.removeChild = (parent, node, index) => {
      previousRemoveChildHook?.(parent, node, index);
      scheduleActiveObserverDeliveries();
    };
  }

  geometryStore.subscribeToGeometryUpdates(scheduleActiveObserverDeliveries);

  const readObservationSnapshot = ({
    target,
    observation,
  }: {
    target: Element;
    observation: Observation;
  }): ElementGeometrySnapshot | null => {
    if (!target.isConnected) {
      observation.geometryReader?.release();
      observation.geometryReader = null;

      return isVisibleSize(observation.lastSize)
        ? EMPTY_ELEMENT_GEOMETRY_SNAPSHOT
        : null;
    }

    observation.geometryReader ??=
      geometryStore.createElementGeometryReader(target);

    return observation.geometryReader.read();
  };

  class ResizeObserverImplementation implements ResizeObserver {
    #callback: ResizeObserverCallback;
    #observations = new Map<WeakRef<Element>, Observation>();
    #targetRefs = new WeakMap<Element, WeakRef<Element>>();
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

      activeObserverSchedules.delete(this.#scheduleDelivery);
    };

    #deliver = () => {
      this.#hasScheduledDelivery = false;

      const devicePixelRatio =
        geometryStore.getViewportSnapshot()?.devicePixelRatio ??
        DEFAULT_DEVICE_PIXEL_RATIO;
      const entries: ResizeObserverEntry[] = [];

      for (const [targetRef, observation] of this.#observations) {
        const target = targetRef.deref();

        if (!isDefined(target)) {
          observation.geometryReader?.release();
          this.#observations.delete(targetRef);
          continue;
        }

        const snapshot = readObservationSnapshot({ target, observation });

        if (!isDefined(snapshot)) {
          continue;
        }

        const size = resolveResizeObserverBoxSize({
          snapshot,
          box: observation.box,
          devicePixelRatio,
        });
        const hasSizeChanged =
          size.inlineSize !== observation.lastSize?.inlineSize ||
          size.blockSize !== observation.lastSize?.blockSize;

        if (!hasSizeChanged) {
          continue;
        }

        observation.lastSize = size;
        entries.push(
          createResizeObserverEntry({ target, snapshot, devicePixelRatio }),
        );
      }

      this.#stopWhenEmpty();

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
      if (!isElementNode(target)) {
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

      const geometryReader =
        existingObservation?.geometryReader ??
        (target.isConnected
          ? geometryStore.createElementGeometryReader(target)
          : null);

      this.#targetRefs.set(target, targetRef);
      this.#observations.set(targetRef, {
        box,
        lastSize: null,
        geometryReader,
      });
      geometryReader?.read();
      activeObserverSchedules.add(this.#scheduleDelivery);
      this.#scheduleDelivery();
    }

    unobserve(target: Element): void {
      const targetRef = this.#targetRefs.get(target);

      if (isDefined(targetRef)) {
        this.#observations.get(targetRef)?.geometryReader?.release();
        this.#observations.delete(targetRef);
      }

      this.#stopWhenEmpty();
    }

    disconnect(): void {
      for (const observation of this.#observations.values()) {
        observation.geometryReader?.release();
      }

      this.#observations.clear();
      this.#stopWhenEmpty();
    }
  }

  return ResizeObserverImplementation;
};
