import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeCloneEventRefKeepingElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-keeping-element-ref';
import { makeCloneEventRefReplacingElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-replacing-element-ref';
import { makeCloneEventRefWithoutInnerClone } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-without-inner-clone';

export const makeCloneEventRef = ({
  elementRef,
  cloneConfig,
  replacesElementRef,
  cloneEvents,
}: {
  elementRef: UserRef;
  cloneConfig: ElementProps;
  replacesElementRef: boolean;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  if (!isCloneEventRef(elementRef)) {
    return makeCloneEventRefWithoutInnerClone({
      elementRef,
      cloneConfig,
      replacesElementRef,
      cloneEvents,
    });
  }

  if (replacesElementRef) {
    return makeCloneEventRefReplacingElementRef({
      innerCloneEventRef: elementRef,
      cloneConfig,
      cloneEvents,
    });
  }

  return makeCloneEventRefKeepingElementRef({
    innerCloneEventRef: elementRef,
    cloneEvents,
  });
};
