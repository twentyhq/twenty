export const JSX_RUNTIME_ELEMENT_EVENT_LISTENER_REGISTRY_SOURCE = `
const eventListenerEntriesByElement = new WeakMap();

function createElementEventListener(listenerEntry) {
  return function (event) {
    const jsxHandler = listenerEntry.handlersBySource.jsx;
    const cloneHandler = listenerEntry.handlersBySource.clone;
    if (jsxHandler && cloneHandler) {
      callChainedEventHandlers({
        thisArg: this,
        event,
        firstHandler: jsxHandler,
        secondHandler: cloneHandler,
      });
      return;
    }

    const handlerOfSingleSource = jsxHandler || cloneHandler;
    if (handlerOfSingleSource) {
      handlerOfSingleSource.call(this, event);
    }
  };
}

function addEventListenerEntry(
  element,
  listenerEntriesByKey,
  listenerDescriptor,
) {
  const listenerEntry = {
    type: listenerDescriptor.type,
    capture: listenerDescriptor.capture,
    handlersBySource: {},
  };
  listenerEntry.listener = createElementEventListener(listenerEntry);
  listenerEntriesByKey[listenerDescriptor.key] = listenerEntry;
  element.addEventListener(
    listenerEntry.type,
    listenerEntry.listener,
    listenerEntry.capture,
  );
  return listenerEntry;
}

function getOrCreateEventListenerEntriesByKey(element) {
  const existingListenerEntriesByKey =
    eventListenerEntriesByElement.get(element);
  if (existingListenerEntriesByKey) {
    return existingListenerEntriesByKey;
  }

  const listenerEntriesByKey = {};
  eventListenerEntriesByElement.set(element, listenerEntriesByKey);
  return listenerEntriesByKey;
}

function setEventHandlersOfSource({
  element,
  listenerEntriesByKey,
  events,
  source,
}) {
  const currentListenerKeys = {};
  for (const eventPropName in events) {
    const listenerDescriptor = toEventListenerDescriptor(eventPropName);
    currentListenerKeys[listenerDescriptor.key] = true;
    const listenerEntry =
      listenerEntriesByKey[listenerDescriptor.key] ||
      addEventListenerEntry(element, listenerEntriesByKey, listenerDescriptor);
    listenerEntry.handlersBySource[source] = events[eventPropName];
  }
  return currentListenerKeys;
}

function removeStaleEventHandlersOfSource({
  element,
  listenerEntriesByKey,
  currentListenerKeys,
  source,
}) {
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
}

function registerElementEventHandlers(element, events, source) {
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
}
`.trim();
