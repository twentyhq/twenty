export const JSX_RUNTIME_EVENT_REF_SOURCE = `
let elementAttachingCloneEventRef = null;

function applyUserRef(userRef, element) {
  if (typeof userRef === 'function') {
    return userRef(element);
  }

  const isObjectRef = userRef != null && typeof userRef === 'object';
  if (isObjectRef) {
    userRef.current = element;
  }
  return undefined;
}

function applyUserRefOfEventRef(userRef, element, source) {
  if (source !== 'clone') {
    return applyUserRef(userRef, element);
  }

  const previousElementAttachingCloneEventRef = elementAttachingCloneEventRef;
  elementAttachingCloneEventRef = element;
  try {
    return applyUserRef(userRef, element);
  } finally {
    elementAttachingCloneEventRef = previousElementAttachingCloneEventRef;
  }
}

function createEventRef(events, userRef, source) {
  const eventRef = function (element) {
    if (element) {
      registerElementEventHandlers(element, events, source);
    }

    const isAttachedWithoutCloneEventRef =
      !!element &&
      source === 'jsx' &&
      elementAttachingCloneEventRef !== element;
    if (isAttachedWithoutCloneEventRef) {
      registerElementEventHandlers(element, {}, 'clone');
    }

    const userRefCleanup = applyUserRefOfEventRef(userRef, element, source);
    const returnsUserRefCleanup =
      !!element && typeof userRefCleanup === 'function';
    return returnsUserRefCleanup ? userRefCleanup : undefined;
  };
  eventRef._eventProps = events;
  eventRef._userRef = userRef;
  eventRef._eventSource = source;
  return eventRef;
}
`.trim();
