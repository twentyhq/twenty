import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';

export type MutationObserverRegistration = {
  sink: MutationRecordSink;
  options: MutationObserverInit;
  isTransient: boolean;
};
