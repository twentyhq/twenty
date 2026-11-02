import { type OutsidePressObservationTransport } from '@/polyfills/events/types/OutsidePressObservationTransport';

export type WorkerOutsidePressObservation = {
  connectTransport: (transport: OutsidePressObservationTransport) => void;
};
