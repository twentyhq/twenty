import { eventListenerEntriesByElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/event-listener-entries-by-element';
import { type EventListenerEntriesByKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-entries-by-key.type';

export const getOrCreateEventListenerEntriesByKey = (element: EventTarget) => {
  const existingListenerEntriesByKey =
    eventListenerEntriesByElement.get(element);
  if (existingListenerEntriesByKey) {
    return existingListenerEntriesByKey;
  }

  const listenerEntriesByKey: EventListenerEntriesByKey = {};
  eventListenerEntriesByElement.set(element, listenerEntriesByKey);
  return listenerEntriesByKey;
};
