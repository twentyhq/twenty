export const JSX_RUNTIME_NESTED_CLONE_EVENTS_SOURCE = `
function toNonEmptyCloneEventsOrNull(cloneEvents) {
  return Object.keys(cloneEvents).length > 0 ? cloneEvents : null;
}

function mergeCloneEventsOuterWinning(innerCloneEvents, outerCloneEvents) {
  return toNonEmptyCloneEventsOrNull(
    Object.assign({}, innerCloneEvents, outerCloneEvents),
  );
}

function chainCloneEvents(innerCloneEvents, outerCloneEvents) {
  const chainedCloneEvents = Object.assign({}, innerCloneEvents);
  for (const eventPropName in outerCloneEvents) {
    const innerHandler = innerCloneEvents[eventPropName];
    const outerHandler = outerCloneEvents[eventPropName];
    chainedCloneEvents[eventPropName] = innerHandler
      ? chainEventHandlers(innerHandler, outerHandler)
      : outerHandler;
  }
  return toNonEmptyCloneEventsOrNull(chainedCloneEvents);
}
`.trim();
