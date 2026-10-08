import { type EventHandlersBySource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-source.type';
import { type EventListenerDescriptor } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-descriptor.type';
import { type EventListenerEntriesByKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-entries-by-key.type';
import { type EventListenerEntry } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-entry.type';
import { createElementEventListener } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-element-event-listener';

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
