import { type EventHandlerSource } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventRef } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref.type';

export const eventRefWithoutHandlersOrUserRefBySource: Partial<
  Record<EventHandlerSource, EventRef>
> = {};
