import { type EventHandler } from '@/front-component-renderer/build/jsx-runtime/types/event-handler.type';
import { callChainedEventHandlers } from '@/front-component-renderer/build/jsx-runtime/utils/call-chained-event-handlers';

export const chainEventHandlers = (
  firstHandler: EventHandler,
  secondHandler: EventHandler,
): EventHandler =>
  function (this: unknown, event: Event) {
    callChainedEventHandlers({
      thisArgument: this,
      event,
      firstHandler,
      secondHandler,
    });
  };
