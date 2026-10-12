import { type EventHandler } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler.type';
import { callChainedEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/call-chained-event-handlers';

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
