import { type EventHandler } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler.type';
import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';

export type EventHandlersBySource = Partial<
  Record<EventHandlerSource, EventHandler>
>;
