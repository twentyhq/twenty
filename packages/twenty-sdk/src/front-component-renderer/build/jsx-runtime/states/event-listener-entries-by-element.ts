import { type EventListenerEntriesByKey } from '@/front-component-renderer/build/jsx-runtime/types/event-listener-entries-by-key.type';

export const eventListenerEntriesByElement = new WeakMap<
  EventTarget,
  EventListenerEntriesByKey
>();
