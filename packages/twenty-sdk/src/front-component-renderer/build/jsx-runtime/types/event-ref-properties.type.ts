import { type EventHandlerSource } from '@/front-component-renderer/build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/front-component-renderer/build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/front-component-renderer/build/jsx-runtime/types/user-ref.type';

export type EventRefProperties = {
  _eventHandlers: EventHandlersByPropName;
  _outerWinningCloneEvents: EventHandlersByPropName | null | undefined;
  _innerRef: UserRef;
  _eventSource: EventHandlerSource;
  _lastInnerRefReplacement?: EventRef;
};
