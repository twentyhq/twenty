import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';

export type MakeCloneEventRefParameters = {
  elementRef: UserRef;
  config: ElementProps;
  replacesElementUserRef: boolean;
  cloneEvents: EventHandlersByPropName | null;
};
