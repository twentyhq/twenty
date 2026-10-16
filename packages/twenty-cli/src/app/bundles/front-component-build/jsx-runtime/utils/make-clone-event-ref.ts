import { type ElementProps } from '@/app/bundles/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/app/bundles/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/app/bundles/front-component-build/jsx-runtime/types/user-ref.type';
import { isCloneEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeCloneEventRefKeepingElementRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/make-clone-event-ref-keeping-element-ref';
import { makeCloneEventRefReplacingElementRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/make-clone-event-ref-replacing-element-ref';
import { makeCloneEventRefWithoutInnerClone } from '@/app/bundles/front-component-build/jsx-runtime/utils/make-clone-event-ref-without-inner-clone';

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
