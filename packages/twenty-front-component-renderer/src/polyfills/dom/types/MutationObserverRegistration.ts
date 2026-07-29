import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';

// A transient registration is the DOM spec's "transient registered observer":
// it is added to a node as it is detached so that mutations inside the removed
// subtree still reach an ancestor's subtree observer, and it lives only until
// that observer's next delivery.
export type MutationObserverRegistration = {
  sink: MutationRecordSink;
  options: MutationObserverInit;
  isTransient?: boolean;
};
