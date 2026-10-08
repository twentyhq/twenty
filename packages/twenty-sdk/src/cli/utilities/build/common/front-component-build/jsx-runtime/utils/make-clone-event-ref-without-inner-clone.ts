import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { getCloneUserRefWithElementJsxEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-clone-user-ref-with-element-jsx-event-handlers';
import { isEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-event-ref';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';

export const makeCloneEventRefWithoutInnerClone = ({
  elementRef,
  cloneConfig,
  replacesElementUserRef,
  cloneEvents,
}: {
  elementRef: UserRef;
  cloneConfig: ElementProps;
  replacesElementUserRef: boolean;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  const cloneUserRef = replacesElementUserRef
    ? getCloneUserRefWithElementJsxEventHandlers({
        elementRef,
        cloneConfig,
        eventHandlersSetByInnerClones: null,
      })
    : elementRef;
  const cloneAddsNoEventHandlers = cloneEvents === null;
  if (cloneAddsNoEventHandlers && isEventRef(cloneUserRef)) {
    return cloneUserRef;
  }

  return makeEventRef(cloneEvents, cloneUserRef, 'clone');
};
