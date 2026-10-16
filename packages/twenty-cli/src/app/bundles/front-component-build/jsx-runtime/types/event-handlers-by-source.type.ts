import { type EventHandler } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler.type';
import { type EventHandlerSource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler-source.type';

export type EventHandlersBySource = Partial<
  Record<EventHandlerSource, EventHandler>
>;
