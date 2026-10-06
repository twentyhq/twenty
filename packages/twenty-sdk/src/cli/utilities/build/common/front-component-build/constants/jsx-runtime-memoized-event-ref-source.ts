export const JSX_RUNTIME_MEMOIZED_EVENT_REF_SOURCE = `
const eventRefWithoutHandlersByUserRefBySource = {
  jsx: new WeakMap(),
  clone: new WeakMap(),
};
const eventRefWithoutHandlersOrUserRefBySource = {};

function getEventRefWithoutHandlersOrUserRef(source) {
  const memoizedEventRef = eventRefWithoutHandlersOrUserRefBySource[source];
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, null, source);
  eventRefWithoutHandlersOrUserRefBySource[source] = eventRef;
  return eventRef;
}

function getEventRefWithoutHandlers(userRef, source) {
  const eventRefByUserRef = eventRefWithoutHandlersByUserRefBySource[source];
  const memoizedEventRef = eventRefByUserRef.get(userRef);
  if (memoizedEventRef) {
    return memoizedEventRef;
  }

  const eventRef = createEventRef({}, userRef, source);
  eventRefByUserRef.set(userRef, eventRef);
  return eventRef;
}

export function makeEventRef(events, userRef, source) {
  if (events) {
    return createEventRef(events, userRef, source);
  }

  if (userRef == null) {
    return getEventRefWithoutHandlersOrUserRef(source);
  }

  return getEventRefWithoutHandlers(userRef, source);
}
`.trim();
