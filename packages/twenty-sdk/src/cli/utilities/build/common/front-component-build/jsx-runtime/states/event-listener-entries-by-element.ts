import { type EventListenerEntriesByKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-entries-by-key.type';

export const eventListenerEntriesByElement = new WeakMap<
  EventTarget,
  EventListenerEntriesByKey
>();
