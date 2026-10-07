export const JSX_RUNTIME_EVENT_REF_SOURCE = `
let cloneEventRefAttachment = null;

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

function getCloneEventRefAttachmentOf(element) {
  const isCloneEventRefAttachingElement =
    cloneEventRefAttachment !== null &&
    cloneEventRefAttachment.element === element;
  return isCloneEventRefAttachingElement ? cloneEventRefAttachment : null;
}

function applyUserRefUnderCloneEventRefAttachment(userRef, attachment) {
  const previousCloneEventRefAttachment = cloneEventRefAttachment;
  cloneEventRefAttachment = attachment;
  try {
    return applyUserRef(userRef, attachment.element);
  } finally {
    cloneEventRefAttachment = previousCloneEventRefAttachment;
  }
}

function attachJsxEventRef({ element, events, userRef }) {
  registerElementEventHandlers(element, events, 'jsx');

  const isAttachedWithoutCloneEventRef =
    getCloneEventRefAttachmentOf(element) === null;
  if (isAttachedWithoutCloneEventRef) {
    registerElementEventHandlers(element, {}, 'clone');
  }

  return applyUserRef(userRef, element);
}

function attachCloneEventRef({
  element,
  events,
  userRef,
  outerWinningCloneEvents,
}) {
  const outerCloneEventRefAttachment = getCloneEventRefAttachmentOf(element);
  if (outerCloneEventRefAttachment !== null) {
    outerCloneEventRefAttachment.hasAttachedInnerCloneEventRef = true;
    return applyUserRef(userRef, element);
  }

  const attachment = { element, hasAttachedInnerCloneEventRef: false };
  registerElementEventHandlers(element, events, 'clone');
  const userRefCleanup = applyUserRefUnderCloneEventRefAttachment(
    userRef,
    attachment,
  );

  const fallsBackToOuterWinningCloneEvents =
    !!outerWinningCloneEvents && !attachment.hasAttachedInnerCloneEventRef;
  if (fallsBackToOuterWinningCloneEvents) {
    registerElementEventHandlers(element, outerWinningCloneEvents, 'clone');
  }

  return userRefCleanup;
}

function createEventRef(events, userRef, source, outerWinningCloneEvents) {
  const eventRef = function (element) {
    if (!element) {
      applyUserRef(userRef, element);
      return undefined;
    }

    const userRefCleanup =
      source === 'clone'
        ? attachCloneEventRef({
            element,
            events,
            userRef,
            outerWinningCloneEvents,
          })
        : attachJsxEventRef({ element, events, userRef });
    return typeof userRefCleanup === 'function' ? userRefCleanup : undefined;
  };
  eventRef._eventProps = events;
  eventRef._outerWinningCloneEvents = outerWinningCloneEvents;
  eventRef._userRef = userRef;
  eventRef._eventSource = source;
  return eventRef;
}
`.trim();
