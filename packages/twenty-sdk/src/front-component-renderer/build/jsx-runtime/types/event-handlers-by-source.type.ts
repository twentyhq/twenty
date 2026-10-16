import { type EventHandler } from '@/front-component-renderer/build/jsx-runtime/types/event-handler.type';
import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';

export type EventHandlersBySource = Partial<
  Record<EventHandlerSource, EventHandler>
>;
