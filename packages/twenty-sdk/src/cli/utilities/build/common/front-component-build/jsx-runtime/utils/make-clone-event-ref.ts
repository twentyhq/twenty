import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeCloneEventRefKeepingInnerCloneUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-keeping-inner-clone-user-ref';
import { makeCloneEventRefReplacingInnerCloneUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-replacing-inner-clone-user-ref';
import { makeCloneEventRefWithoutInnerClone } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-without-inner-clone';

export const makeCloneEventRef = ({
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
  if (!isCloneEventRef(elementRef)) {
    return makeCloneEventRefWithoutInnerClone({
      elementRef,
      cloneConfig,
      replacesElementUserRef,
      cloneEvents,
    });
  }

  if (replacesElementUserRef) {
    return makeCloneEventRefReplacingInnerCloneUserRef({
      innerCloneEventRef: elementRef,
      cloneConfig,
      cloneEvents,
    });
  }

  return makeCloneEventRefKeepingInnerCloneUserRef({
    innerCloneEventRef: elementRef,
    cloneEvents,
  });
};
