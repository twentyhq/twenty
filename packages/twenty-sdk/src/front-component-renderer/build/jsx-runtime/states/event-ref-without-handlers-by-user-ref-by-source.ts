import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';

export const eventRefWithoutHandlersByUserRefBySource: Record<
  EventHandlerSource,
  WeakMap<object, EventRef>
> = {
  jsx: new WeakMap(),
  clone: new WeakMap(),
};
