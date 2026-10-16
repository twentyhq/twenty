import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';

export const eventRefWithoutHandlersOrUserRefBySource: Partial<
  Record<EventHandlerSource, EventRef>
> = {};
