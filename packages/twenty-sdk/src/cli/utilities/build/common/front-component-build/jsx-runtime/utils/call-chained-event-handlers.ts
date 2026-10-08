import { type EventHandler } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler.type';
import { isSyntheticLikeEvent } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-synthetic-like-event';

export const callChainedEventHandlers = ({
  thisArgument,
  event,
  firstHandler,
  secondHandler,
}: {
  thisArgument: unknown;
  event: Event;
  firstHandler: EventHandler;
  secondHandler: EventHandler;
}) => {
  const isPreventableEvent = isSyntheticLikeEvent(event);
  if (isPreventableEvent) {
    event.preventBaseUIHandler = function () {
      event.baseUIHandlerPrevented = true;
    };
  }

  firstHandler.call(thisArgument, event);

  const isSecondHandlerPrevented =
    isPreventableEvent && !!event.baseUIHandlerPrevented;
  if (!isSecondHandlerPrevented) {
    secondHandler.call(thisArgument, event);
  }
};
