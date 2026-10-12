import { eventListenerEntriesByElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/states/event-listener-entries-by-element';
import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { getOrCreateEventListenerEntriesByKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-or-create-event-listener-entries-by-key';
import { removeStaleEventHandlersOfSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/remove-stale-event-handlers-of-source';
import { setEventHandlersOfSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/set-event-handlers-of-source';

export const registerElementEventHandlers = (
  element: EventTarget,
  events: EventHandlersByPropName,
  source: EventHandlerSource,
) => {
  const hasEventHandlers = Object.keys(events).length > 0;
  const isElementInListenerRegistry =
    eventListenerEntriesByElement.has(element);
  if (!hasEventHandlers && !isElementInListenerRegistry) {
    return;
  }

  const listenerEntriesByKey = getOrCreateEventListenerEntriesByKey(element);
  const currentListenerKeys = setEventHandlersOfSource({
    element,
    listenerEntriesByKey,
    events,
    source,
  });
  removeStaleEventHandlersOfSource({
    element,
    listenerEntriesByKey,
    currentListenerKeys,
    source,
  });
};
