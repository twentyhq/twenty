import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { doesCloneConfigSetEventProp } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/does-clone-config-set-event-prop';
import { findJsxEventRefOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/find-jsx-event-ref-of';
import { getOuterWinningCloneEventsOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { isAnyEventPropOverridden } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-any-event-prop-overridden';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { omitOverriddenEventProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/omit-overridden-event-props';
import { replaceJsxEventRefUserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/replace-jsx-event-ref-user-ref';

export const makeJsxEventRefNotOverriddenByClone = (
  elementRef: UserRef,
  config: ElementProps,
): UserRef => {
  const jsxEventRef = findJsxEventRefOf(elementRef);
  if (jsxEventRef === null) {
    return config.ref;
  }

  const innerOuterWinningCloneEvents = isCloneEventRef(elementRef)
    ? getOuterWinningCloneEventsOf(elementRef)
    : null;
  const isJsxEventPropOverriddenByClone = (eventPropName: string) =>
    doesCloneConfigSetEventProp(config, eventPropName) ||
    (innerOuterWinningCloneEvents !== null &&
      eventPropName in innerOuterWinningCloneEvents);
  const jsxEvents = jsxEventRef._eventProps;
  if (!isAnyEventPropOverridden(jsxEvents, isJsxEventPropOverriddenByClone)) {
    return replaceJsxEventRefUserRef(jsxEventRef, config.ref);
  }

  return makeEventRef(
    omitOverriddenEventProps(jsxEvents, isJsxEventPropOverriddenByClone),
    config.ref,
    'jsx',
  );
};
