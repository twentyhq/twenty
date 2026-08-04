import { type MutationObserverRegistration } from '@/polyfills/dom/types/MutationObserverRegistration';
import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';

type HasTransientRegistrationForObservationInput = {
  registrations: MutationObserverRegistration[];
  sink: MutationRecordSink;
  options: MutationObserverInit;
};

export const hasTransientRegistrationForObservation = ({
  registrations,
  sink,
  options,
}: HasTransientRegistrationForObservationInput): boolean =>
  registrations.some(
    (registration) =>
      registration.isTransient === true &&
      registration.sink === sink &&
      registration.options === options,
  );
