import { type Hooks } from '@remote-dom/polyfill';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { OUTSIDE_PRESS_OBSERVATION_TRANSPORT_FAILURE_WARNING } from '@/polyfills/events/constants/OutsidePressObservationTransportFailureWarning';
import { type OutsidePressObservationTransport } from '@/polyfills/events/types/OutsidePressObservationTransport';
import { type WorkerOutsidePressObservation } from '@/polyfills/events/types/WorkerOutsidePressObservation';
import { resolveAddEventListenerOptions } from '@/polyfills/utils/resolveAddEventListenerOptions';
import { isOutsidePressEventType } from '@/utils/isOutsidePressEventType';

type ListenerRegistration = {
  target: EventTarget;
  eventType: string;
  listener: EventListenerOrEventListenerObject | null;
  options?: boolean | EventListenerOptions;
};

export const installOutsidePressObservation = ({
  hooks,
  documentTarget,
}: {
  hooks: Partial<Hooks> | null;
  documentTarget: Document;
}): WorkerOutsidePressObservation => {
  if (!isDefined(hooks)) {
    throw new CustomError(
      'Outside-press observation requires DOM event listener hooks',
      'FRONT_COMPONENT_EVENT_LISTENER_HOOKS_UNAVAILABLE',
    );
  }

  const registrationKeysByListener = new WeakMap<object, Set<string>>();
  let registrationCount = 0;
  let isObservationReported = false;
  let hasScheduledObservationFlush = false;
  let hasWarnedAboutTransportFailure = false;
  let transport: OutsidePressObservationTransport | null = null;

  const warnAboutTransportFailure = (): void => {
    if (hasWarnedAboutTransportFailure) {
      return;
    }

    hasWarnedAboutTransportFailure = true;
    console.warn(OUTSIDE_PRESS_OBSERVATION_TRANSPORT_FAILURE_WARNING);
  };

  const flushObservation = (): void => {
    hasScheduledObservationFlush = false;

    const isObserved = registrationCount > 0;

    if (!isDefined(transport) || isObserved === isObservationReported) {
      return;
    }

    isObservationReported = isObserved;

    const observationRequest = isObserved
      ? transport.observeOutsidePresses()
      : transport.unobserveOutsidePresses();

    observationRequest.catch(warnAboutTransportFailure);
  };

  const scheduleObservationFlush = (): void => {
    if (hasScheduledObservationFlush) {
      return;
    }

    hasScheduledObservationFlush = true;
    queueMicrotask(flushObservation);
  };

  const resolveRegistrationKey = ({
    target,
    eventType,
    options,
  }: Omit<ListenerRegistration, 'listener'>): string | undefined => {
    if (target !== documentTarget || !isOutsidePressEventType(eventType)) {
      return undefined;
    }

    const isCapture = resolveAddEventListenerOptions(options).capture === true;

    return `${eventType}:${isCapture}`;
  };

  const trackAddedListener = ({
    listener,
    ...registration
  }: ListenerRegistration): void => {
    const registrationKey = resolveRegistrationKey(registration);

    if (!isDefined(registrationKey) || !isDefined(listener)) {
      return;
    }

    const registrationKeys =
      registrationKeysByListener.get(listener) ?? new Set<string>();

    if (registrationKeys.has(registrationKey)) {
      return;
    }

    registrationKeys.add(registrationKey);
    registrationKeysByListener.set(listener, registrationKeys);
    registrationCount += 1;
    scheduleObservationFlush();
  };

  const trackRemovedListener = ({
    listener,
    ...registration
  }: ListenerRegistration): void => {
    const registrationKey = resolveRegistrationKey(registration);

    if (
      !isDefined(registrationKey) ||
      !isDefined(listener) ||
      !registrationKeysByListener.get(listener)?.delete(registrationKey)
    ) {
      return;
    }

    registrationCount -= 1;
    scheduleObservationFlush();
  };

  const previousAddEventListenerHook = hooks.addEventListener;
  const previousRemoveEventListenerHook = hooks.removeEventListener;

  hooks.addEventListener = (target, eventType, listener, options) => {
    trackAddedListener({ target, eventType, listener, options });
    previousAddEventListenerHook?.(target, eventType, listener, options);
  };

  hooks.removeEventListener = (target, eventType, listener, options) => {
    trackRemovedListener({ target, eventType, listener, options });
    previousRemoveEventListenerHook?.(target, eventType, listener, options);
  };

  return {
    connectTransport: (nextTransport) => {
      transport = nextTransport;
      flushObservation();
    },
  };
};
