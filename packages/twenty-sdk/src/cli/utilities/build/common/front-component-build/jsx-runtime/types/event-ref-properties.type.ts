import { type EventHandlerSource } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handler-source.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export type EventRefProperties = {
  _eventProps: EventHandlersByPropName;
  _outerWinningCloneEvents: EventHandlersByPropName | null | undefined;
  _userRef: UserRef;
  _eventSource: EventHandlerSource;
};
