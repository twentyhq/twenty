import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { type WorkerMediaQueryListEvent } from '@/polyfills/media-query/types/WorkerMediaQueryListEvent';
import { type WorkerMediaQueryListener } from '@/polyfills/media-query/types/WorkerMediaQueryListener';
import { createWorkerMediaQueryListEvent } from '@/polyfills/media-query/utils/createWorkerMediaQueryListEvent';
import { resolveAddEventListenerOptions } from '@/polyfills/utils/resolveAddEventListenerOptions';

const CHANGE_EVENT_TYPE = 'change';

type CreateWorkerMediaQueryListInput = {
  media: string;
  evaluateMatches: () => boolean;
  subscribeToEnvironmentUpdates: (listener: () => void) => () => void;
  reportListenerError: (error: unknown) => void;
};

type ChangeListenerRegistration = {
  listener: EventListenerOrEventListenerObject;
  once: boolean;
  removeAbortListener: (() => void) | null;
};

class WorkerMediaQueryListImplementation extends EventTarget {
  readonly media: string;

  #evaluateMatches: () => boolean;
  #subscribeToEnvironmentUpdates: (listener: () => void) => () => void;
  #reportListenerError: (error: unknown) => void;

  #changeListenerRegistrations: ChangeListenerRegistration[] = [];
  #onchangeHandler: WorkerMediaQueryListener | null = null;
  #onchangeInvoker: EventListener | null = null;
  #lastNotifiedMatches: boolean | null = null;
  #unsubscribeFromEnvironmentUpdates: (() => void) | null = null;

  constructor({
    media,
    evaluateMatches,
    subscribeToEnvironmentUpdates,
    reportListenerError,
  }: CreateWorkerMediaQueryListInput) {
    super();

    this.media = media;
    this.#evaluateMatches = evaluateMatches;
    this.#subscribeToEnvironmentUpdates = subscribeToEnvironmentUpdates;
    this.#reportListenerError = reportListenerError;

    super.addEventListener(CHANGE_EVENT_TYPE, (event) => {
      this.#invokeChangeListeners(event);
    });
  }

  get matches(): boolean {
    return this.#evaluateMatches();
  }

  get onchange(): WorkerMediaQueryListener | null {
    return this.#onchangeHandler;
  }

  set onchange(handler: WorkerMediaQueryListener | null) {
    this.#onchangeHandler = isFunction(handler) ? handler : null;

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

    const { once, signal } = resolveAddEventListenerOptions(options);

    if (
      signal?.aborted === true ||
      isDefined(this.#findChangeListenerRegistration(listener))
    ) {
      return;
    }

    const registration: ChangeListenerRegistration = {
      listener,
      once: once === true,
      removeAbortListener: null,
    };

    if (isDefined(signal)) {
      const handleAbort = () => {
        this.#removeChangeListenerRegistration(registration);
      };

      signal.addEventListener('abort', handleAbort, { once: true });
      registration.removeAbortListener = () => {
        signal.removeEventListener('abort', handleAbort);
      };
    }

    this.#changeListenerRegistrations.push(registration);
    this.#ensureEnvironmentSubscription();
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

    const registration = this.#findChangeListenerRegistration(listener);

    if (isDefined(registration)) {
      this.#removeChangeListenerRegistration(registration);
    }
  }

  addListener(listener: WorkerMediaQueryListener): void {
    this.addEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  removeListener(listener: WorkerMediaQueryListener): void {
    this.removeEventListener(CHANGE_EVENT_TYPE, listener as EventListener);
  }

  #findChangeListenerRegistration(
    listener: EventListenerOrEventListenerObject,
  ): ChangeListenerRegistration | undefined {
    return this.#changeListenerRegistrations.find(
      (registration) => registration.listener === listener,
    );
  }

  #removeChangeListenerRegistration(
    registration: ChangeListenerRegistration,
  ): void {
    const registrationIndex =
      this.#changeListenerRegistrations.indexOf(registration);

    if (registrationIndex === -1) {
      return;
    }

    this.#changeListenerRegistrations.splice(registrationIndex, 1);
    registration.removeAbortListener?.();
    this.#releaseEnvironmentSubscriptionIfUnused();
  }

  #invokeChangeListeners(event: Event): void {
    for (const registration of [...this.#changeListenerRegistrations]) {
      if (!this.#changeListenerRegistrations.includes(registration)) {
        continue;
      }

      if (registration.once) {
        this.#removeChangeListenerRegistration(registration);
      }

      this.#invokeChangeListener(registration.listener, event);

      if (event.cancelBubble) {
        return;
      }
    }
  }

  #invokeChangeListener(
    listener: EventListenerOrEventListenerObject,
    event: Event,
  ): void {
    try {
      if (isFunction(listener)) {
        listener.call(this, event);
        return;
      }

      listener.handleEvent(event);
    } catch (error) {
      this.#reportListenerError(error);
    }
  }

  #ensureOnchangeInvoker(): void {
    if (isDefined(this.#onchangeInvoker)) {
      return;
    }

    const onchangeInvoker: EventListener = (event) => {
      this.#onchangeHandler?.call(this, event as WorkerMediaQueryListEvent);
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
      this.#subscribeToEnvironmentUpdates(() => {
        this.#handleEnvironmentUpdate();
      });
  }

  #releaseEnvironmentSubscriptionIfUnused(): void {
    if (
      this.#changeListenerRegistrations.length > 0 ||
      !isDefined(this.#unsubscribeFromEnvironmentUpdates)
    ) {
      return;
    }

    this.#unsubscribeFromEnvironmentUpdates();
    this.#unsubscribeFromEnvironmentUpdates = null;
  }

  #handleEnvironmentUpdate(): void {
    const nextMatches = this.#evaluateMatches();

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
