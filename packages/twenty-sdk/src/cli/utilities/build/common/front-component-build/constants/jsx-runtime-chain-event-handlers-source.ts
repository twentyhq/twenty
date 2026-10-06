export const JSX_RUNTIME_CHAIN_EVENT_HANDLERS_SOURCE = `
function isSyntheticLikeEvent(event) {
  return event != null && typeof event === 'object' && 'nativeEvent' in event;
}

function callChainedEventHandlers({
  thisArg,
  event,
  firstHandler,
  secondHandler,
}) {
  const isPreventableEvent = isSyntheticLikeEvent(event);
  if (isPreventableEvent) {
    event.preventBaseUIHandler = function () {
      event.baseUIHandlerPrevented = true;
    };
  }

  firstHandler.call(thisArg, event);

  const isSecondHandlerPrevented =
    isPreventableEvent && !!event.baseUIHandlerPrevented;
  if (!isSecondHandlerPrevented) {
    secondHandler.call(thisArg, event);
  }
}

function chainEventHandlers(firstHandler, secondHandler) {
  return function (event) {
    callChainedEventHandlers({
      thisArg: this,
      event,
      firstHandler,
      secondHandler,
    });
  };
}
`.trim();
