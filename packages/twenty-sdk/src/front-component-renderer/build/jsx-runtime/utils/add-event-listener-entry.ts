import { type EventHandlersBySource } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-source.type';
import { type EventListenerDescriptor } from '@/front-component-renderer/build/jsx-runtime/types/event-listener-descriptor.type';
import { type EventListenerEntriesByKey } from '@/front-component-renderer/build/jsx-runtime/types/event-listener-entries-by-key.type';
import { type EventListenerEntry } from '@/front-component-renderer/build/jsx-runtime/types/event-listener-entry.type';
import { createElementEventListener } from '@/front-component-renderer/build/jsx-runtime/utils/create-element-event-listener';

export const addEventListenerEntry = (
  element: EventTarget,
  listenerEntriesByKey: EventListenerEntriesByKey,
  listenerDescriptor: EventListenerDescriptor,
) => {
  const handlersBySource: EventHandlersBySource = {};
  const listenerEntry: EventListenerEntry = {
    type: listenerDescriptor.type,
    capture: listenerDescriptor.capture,
    handlersBySource,
    listener: createElementEventListener(handlersBySource),
  };
  listenerEntriesByKey[listenerDescriptor.key] = listenerEntry;
  element.addEventListener(
    listenerEntry.type,
    listenerEntry.listener,
    listenerEntry.capture,
  );
  return listenerEntry;
};
