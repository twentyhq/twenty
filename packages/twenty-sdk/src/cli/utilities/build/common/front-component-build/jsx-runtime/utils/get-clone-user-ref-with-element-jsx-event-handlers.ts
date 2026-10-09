import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { findInnermostJsxEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/find-innermost-jsx-event-ref';
import { getJsxEventPropNamesOverriddenByClone } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-jsx-event-prop-names-overridden-by-clone';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { omitEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/omit-event-handlers';
import { replaceJsxEventRefInnerRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/replace-jsx-event-ref-inner-ref';

export const getCloneUserRefWithElementJsxEventHandlers = ({
  elementRef,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  elementRef: UserRef;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}): UserRef => {
  const cloneUserRef = cloneConfig.ref;
  const elementJsxEventRef = findInnermostJsxEventRef(elementRef);
  if (elementJsxEventRef === null) {
    return cloneUserRef;
  }

  const elementJsxEventHandlers = elementJsxEventRef._eventHandlers;
  const jsxEventPropNamesOverriddenByClone =
    getJsxEventPropNamesOverriddenByClone({
      jsxEventHandlers: elementJsxEventHandlers,
      cloneConfig,
      eventHandlersSetByInnerClones,
    });
  if (jsxEventPropNamesOverriddenByClone.length === 0) {
    return replaceJsxEventRefInnerRef(elementJsxEventRef, cloneUserRef);
  }

  const remainingJsxEventHandlers = omitEventHandlers(
    elementJsxEventHandlers,
    jsxEventPropNamesOverriddenByClone,
  );
  const hasRemainingJsxEventHandlers =
    Object.keys(remainingJsxEventHandlers).length > 0;
  return makeEventRef(
    hasRemainingJsxEventHandlers ? remainingJsxEventHandlers : null,
    cloneUserRef,
    'jsx',
  );
};
