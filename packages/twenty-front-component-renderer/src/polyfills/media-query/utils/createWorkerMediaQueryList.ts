import { isFunction, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';
import { createWorkerMediaQueryListEvent } from '@/polyfills/media-query/utils/createWorkerMediaQueryListEvent';

const CHANGE_EVENT_TYPE = 'change';

type CreateWorkerMediaQueryListInput = {
  media: string;
  readEnvironment: () => MediaQueryEnvironment;
  evaluateMatches: (environment: MediaQueryEnvironment) => boolean;
  subscribeToEnvironmentUpdates: (
    listener: MediaQueryEnvironmentListener,
  ) => () => void;
};

const resolveListenerOptions = (
  options?: AddEventListenerOptions | boolean,
): AddEventListenerOptions => (isObject(options) ? options : {});

class WorkerMediaQueryListImplementation extends EventTarget {
  readonly media: string;

  #readEnvironment: () => MediaQueryEnvironment;
  #evaluateMatches: (environment: MediaQueryEnvironment) => boolean;
  #subscribeToEnvironmentUpdates: (
    listener: MediaQueryEnvironmentListener,
  ) => () => void;

  #registeredChangeListeners = new Set<EventListenerOrEventListenerObject>();
  #onchangeListener: WorkerMediaQueryListener | null = null;
  #lastNotifiedMatches: boolean | null = null;
  #unsubscribeFromEnvironmentUpdates: (() => void) | null = null;

  constructor({
    media,
    readEnvironment,
    evaluateMatches,
    subscribeToEnvironmentUpdates,
  }: CreateWorkerMediaQueryListInput) {
    super();

    this.media = media;
    this.#readEnvironment = readEnvironment;
    this.#evaluateMatches = evaluateMatches;
    this.#subscribeToEnvironmentUpdates = subscribeToEnvironmentUpdates;
  }

  get matches(): boolean {
    return this.#evaluateMatches(this.#readEnvironment());
  }

  get onchange(): WorkerMediaQueryListener | null {
    return this.#onchangeListener;
  }

  set onchange(listener: WorkerMediaQueryListener | null) {
    if (isDefined(this.#onchangeListener)) {
      this.removeEventListener(
        CHANGE_EVENT_TYPE,
        this.#onchangeListener as EventListener,
      );
    }

    this.#onchangeListener = isFunction(listener) ? listener : null;

    if (isDefined(this.#onchangeListener)) {
      this.addEventListener(
        CHANGE_EVENT_TYPE,
        this.#onchangeListener as EventListener,
      );
    }
  }

  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, listener, options);

    if (type !== CHANGE_EVENT_TYPE || !isDefined(listener)) {
      return;
    }

    this.#trackChangeListener(listener, resolveListenerOptions(options));
  }

  override removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    super.removeEventListener(type, listener, options);

    if (type !== CHANGE_EVENT_TYPE || !isDefined(listener)) {
      return;
    }

    this.#untrackChangeListener(listener);
  }

  addListener(listener: WorkerMediaQueryListener): void {
    this.addEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  removeListener(listener: WorkerMediaQueryListener): void {
    this.removeEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  #trackChangeListener(
    listener: EventListenerOrEventListenerObject,
    { once, signal }: AddEventListenerOptions,
  ): void {
    if (signal?.aborted === true) {
      return;
    }

    if (this.#registeredChangeListeners.has(listener)) {
      return;
    }

    this.#registeredChangeListeners.add(listener);
    this.#ensureEnvironmentSubscription();

    const untrackListener = () => {
      this.#untrackChangeListener(listener);
    };

    if (once === true) {
      super.addEventListener(CHANGE_EVENT_TYPE, untrackListener, {
        once: true,
        signal,
      });
    }

    signal?.addEventListener('abort', untrackListener, { once: true });
  }

  #untrackChangeListener(listener: EventListenerOrEventListenerObject): void {
    if (!this.#registeredChangeListeners.delete(listener)) {
      return;
    }

    this.#releaseEnvironmentSubscriptionIfUnused();
  }

  #ensureEnvironmentSubscription(): void {
    if (isDefined(this.#unsubscribeFromEnvironmentUpdates)) {
      return;
    }

    this.#lastNotifiedMatches = this.matches;
    this.#unsubscribeFromEnvironmentUpdates =
      this.#subscribeToEnvironmentUpdates((environment) => {
        this.#handleEnvironmentUpdate(environment);
      });
  }

  #releaseEnvironmentSubscriptionIfUnused(): void {
    if (this.#registeredChangeListeners.size > 0) {
      return;
    }

    if (!isDefined(this.#unsubscribeFromEnvironmentUpdates)) {
      return;
    }

    this.#unsubscribeFromEnvironmentUpdates();
    this.#unsubscribeFromEnvironmentUpdates = null;
  }

  #handleEnvironmentUpdate(environment: MediaQueryEnvironment): void {
    const nextMatches = this.#evaluateMatches(environment);

    if (nextMatches === this.#lastNotifiedMatches) {
      return;
    }

    this.#lastNotifiedMatches = nextMatches;

    this.dispatchEvent(
      createWorkerMediaQueryListEvent({
        media: this.media,
        matches: nextMatches,
      }),
    );
  }
}

export const createWorkerMediaQueryList = (
  input: CreateWorkerMediaQueryListInput,
): WorkerMediaQueryList => new WorkerMediaQueryListImplementation(input);
