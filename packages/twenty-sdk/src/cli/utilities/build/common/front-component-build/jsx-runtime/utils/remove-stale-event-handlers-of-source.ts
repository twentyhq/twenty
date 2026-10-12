import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventListenerEntriesByKey } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-entries-by-key.type';

export const removeStaleEventHandlersOfSource = ({
  element,
  listenerEntriesByKey,
  currentListenerKeys,
  source,
}: {
  element: EventTarget;
  listenerEntriesByKey: EventListenerEntriesByKey;
  currentListenerKeys: Record<string, boolean>;
  source: EventHandlerSource;
}) => {
  for (const listenerKey in listenerEntriesByKey) {
    const listenerEntry = listenerEntriesByKey[listenerKey];
    const isCurrentListener = !!currentListenerKeys[listenerKey];
    const hasHandlerOfSource = !!listenerEntry.handlersBySource[source];
    if (isCurrentListener || !hasHandlerOfSource) {
      continue;
    }

    delete listenerEntry.handlersBySource[source];
    const hasHandlerOfAnySource =
      !!listenerEntry.handlersBySource.jsx ||
      !!listenerEntry.handlersBySource.clone;
    if (hasHandlerOfAnySource) {
      continue;
    }

    delete listenerEntriesByKey[listenerKey];
    element.removeEventListener(
      listenerEntry.type,
      listenerEntry.listener,
      listenerEntry.capture,
    );
  }
};
