import { type EventHandlerSource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventListenerEntriesByKey } from '@/app/bundles/front-component-build/jsx-runtime/types/event-listener-entries-by-key.type';
import { addEventListenerEntry } from '@/app/bundles/front-component-build/jsx-runtime/utils/add-event-listener-entry';
import { toEventListenerDescriptor } from '@/app/bundles/front-component-build/jsx-runtime/utils/to-event-listener-descriptor';

export const setEventHandlersOfSource = ({
  element,
  listenerEntriesByKey,
  events,
  source,
}: {
  element: EventTarget;
  listenerEntriesByKey: EventListenerEntriesByKey;
  events: EventHandlersByPropName;
  source: EventHandlerSource;
}) => {
  const currentListenerKeys: Record<string, boolean> = {};
  for (const eventPropName in events) {
    const listenerDescriptor = toEventListenerDescriptor(eventPropName);
    currentListenerKeys[listenerDescriptor.key] = true;
    const listenerEntry =
      listenerEntriesByKey[listenerDescriptor.key] ||
      addEventListenerEntry(element, listenerEntriesByKey, listenerDescriptor);
    listenerEntry.handlersBySource[source] = events[eventPropName];
  }
  return currentListenerKeys;
};
