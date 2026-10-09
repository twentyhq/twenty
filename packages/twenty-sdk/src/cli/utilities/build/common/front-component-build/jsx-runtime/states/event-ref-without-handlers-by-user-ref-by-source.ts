import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';

export const eventRefWithoutHandlersByUserRefBySource: Record<
  EventHandlerSource,
  WeakMap<object, EventRef>
> = {
  jsx: new WeakMap(),
  clone: new WeakMap(),
};
