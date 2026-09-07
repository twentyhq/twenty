import { isFunction, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';
import { createWorkerMediaQueryListEvent } from '@/polyfills/media-query/utils/createWorkerMediaQueryListEvent';
import { resolveAddEventListenerOptions } from '@/polyfills/utils/resolveAddEventListenerOptions';
import { resolveEventListenerCapture } from '@/polyfills/utils/resolveEventListenerCapture';

const CHANGE_EVENT_TYPE = 'change';

type CreateWorkerMediaQueryListInput = {
  media: string;
  readEnvironment: () => MediaQueryEnvironment;
  evaluateMatches: (environment: MediaQueryEnvironment) => boolean;
  subscribeToEnvironmentUpdates: (
    listener: MediaQueryEnvironmentListener,
  ) => () => void;
};

type ChangeListenerRegistration = {
  nativeListener: EventListenerOrEventListenerObject;
  cleanUp: () => void;
};

type PendingChangeListenerRegistration = {
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean | null;
};

class WorkerMediaQueryListImplementation extends EventTarget {
  readonly media: string;

  #readEnvironment: () => MediaQueryEnvironment;
  #evaluateMatches: (environment: MediaQueryEnvironment) => boolean;
  #subscribeToEnvironmentUpdates: (
    listener: MediaQueryEnvironmentListener,
  ) => () => void;

  #changeListenerRegistrations = new Map<
    EventListenerOrEventListenerObject,
    Map<boolean, ChangeListenerRegistration>
  >();
  #pendingChangeListenerRegistrations: PendingChangeListenerRegistration[] = [];
  #changeEventDispatchDepth = 0;
  #onchangeHandler: WorkerMediaQueryListener | EventListenerObject | null =
    null;
  #onchangeInvoker: EventListener | null = null;
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
    return this.#onchangeHandler as WorkerMediaQueryListener | null;
  }

  set onchange(handler: WorkerMediaQueryListener | null) {
    this.#onchangeHandler =
      isFunction(handler) || isObject(handler) ? handler : null;

    if (isDefined(this.#onchangeHandler)) {
      this.#ensureOnchangeInvoker();
      return;
    }

    this.#removeOnchangeInvoker();
  }

  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean | null,
  ): void {
    if (type !== CHANGE_EVENT_TYPE || !isDefined(listener)) {
      super.addEventListener(type, listener, options ?? undefined);
      return;
    }

    if (this.#changeEventDispatchDepth > 0) {
      this.#pendingChangeListenerRegistrations.push({ listener, options });
      return;
    }

    this.#registerChangeListener(listener, options);
  }

  override removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean | null,
  ): void {
    if (type !== CHANGE_EVENT_TYPE || !isDefined(listener)) {
      super.removeEventListener(type, listener, options ?? undefined);
      return;
    }

    const capture = resolveEventListenerCapture(options);

    this.#pendingChangeListenerRegistrations =
      this.#pendingChangeListenerRegistrations.filter(
        (pendingRegistration) =>
          pendingRegistration.listener !== listener ||
          resolveEventListenerCapture(pendingRegistration.options) !== capture,
      );

    const hasRegistration =
      this.#changeListenerRegistrations.get(listener)?.has(capture) === true;

    if (!hasRegistration) {
      super.removeEventListener(type, listener, options ?? undefined);
      return;
    }

    this.#removeChangeListenerRegistration(listener, capture);
  }

  override dispatchEvent(event: Event): boolean {
    if (event.type !== CHANGE_EVENT_TYPE) {
      return super.dispatchEvent(event);
    }

    this.#changeEventDispatchDepth += 1;

    try {
      return super.dispatchEvent(event);
    } finally {
      this.#changeEventDispatchDepth -= 1;

      if (this.#changeEventDispatchDepth === 0) {
        this.#flushPendingChangeListenerRegistrations();
      }
    }
  }

  addListener(listener: WorkerMediaQueryListener): void {
    this.addEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  removeListener(listener: WorkerMediaQueryListener): void {
    this.removeEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  #registerChangeListener(
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean | null,
  ): void {
    const { capture, once, signal } = resolveAddEventListenerOptions(options);
    const isCapture = capture === true;

    if (signal?.aborted === true) {
      return;
    }

    if (
      this.#changeListenerRegistrations.get(listener)?.has(isCapture) === true
    ) {
      return;
    }

    const removeRegistration = () => {
      this.#removeChangeListenerRegistration(listener, isCapture);
    };

    const nativeListener: EventListenerOrEventListenerObject =
      once === true
        ? (event: Event) => {
            removeRegistration();

            if (isFunction(listener)) {
              listener.call(this, event);
              return;
            }

            listener.handleEvent(event);
          }
        : listener;

    super.addEventListener(CHANGE_EVENT_TYPE, nativeListener, {
      capture: isCapture,
    });

    const cleanUpFunctions: (() => void)[] = [];

    if (isDefined(signal)) {
      signal.addEventListener('abort', removeRegistration, { once: true });
      cleanUpFunctions.push(() => {
        signal.removeEventListener('abort', removeRegistration);
      });
    }

    const registrationsByCapture =
      this.#changeListenerRegistrations.get(listener) ??
      new Map<boolean, ChangeListenerRegistration>();

    registrationsByCapture.set(isCapture, {
      nativeListener,
      cleanUp: () => {
        for (const cleanUpFunction of cleanUpFunctions) {
          cleanUpFunction();
        }
      },
    });
    this.#changeListenerRegistrations.set(listener, registrationsByCapture);
    this.#ensureEnvironmentSubscription();
  }

  #removeChangeListenerRegistration(
    listener: EventListenerOrEventListenerObject,
    capture: boolean,
  ): void {
    const registration = this.#changeListenerRegistrations
      .get(listener)
      ?.get(capture);

    if (!isDefined(registration)) {
      return;
    }

    super.removeEventListener(CHANGE_EVENT_TYPE, registration.nativeListener, {
      capture,
    });
    this.#untrackChangeListener(listener, capture);
  }

  #untrackChangeListener(
    listener: EventListenerOrEventListenerObject,
    capture: boolean,
  ): void {
    const registrationsByCapture =
      this.#changeListenerRegistrations.get(listener);
    const registration = registrationsByCapture?.get(capture);

    if (!isDefined(registrationsByCapture) || !isDefined(registration)) {
      return;
    }

    registrationsByCapture.delete(capture);

    if (registrationsByCapture.size === 0) {
      this.#changeListenerRegistrations.delete(listener);
    }

    registration.cleanUp();
    this.#releaseEnvironmentSubscriptionIfUnused();
  }

  #flushPendingChangeListenerRegistrations(): void {
    const pendingRegistrations = this.#pendingChangeListenerRegistrations;
    this.#pendingChangeListenerRegistrations = [];

    for (const { listener, options } of pendingRegistrations) {
      this.#registerChangeListener(listener, options);
    }
  }

  #ensureOnchangeInvoker(): void {
    if (isDefined(this.#onchangeInvoker)) {
      return;
    }

    const onchangeInvoker: EventListener = (event) => {
      const handler = this.#onchangeHandler;

      if (isFunction(handler)) {
        handler.call(this, event as Parameters<WorkerMediaQueryListener>[0]);
      }
    };

    this.#onchangeInvoker = onchangeInvoker;
    this.addEventListener(CHANGE_EVENT_TYPE, onchangeInvoker);
  }

  #removeOnchangeInvoker(): void {
    if (!isDefined(this.#onchangeInvoker)) {
      return;
    }

    this.removeEventListener(CHANGE_EVENT_TYPE, this.#onchangeInvoker);
    this.#onchangeInvoker = null;
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
    if (this.#changeListenerRegistrations.size > 0) {
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
