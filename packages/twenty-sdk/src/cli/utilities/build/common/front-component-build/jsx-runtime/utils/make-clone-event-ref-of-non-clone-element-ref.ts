import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type MakeCloneEventRefParameters } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/make-clone-event-ref-parameters.type';
import { isEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-event-ref';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { makeJsxEventRefNotOverriddenByClone } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-jsx-event-ref-not-overridden-by-clone';

export const makeCloneEventRefOfNonCloneElementRef = ({
  elementRef,
  config,
  replacesElementUserRef,
  cloneEvents,
}: MakeCloneEventRefParameters): EventRef => {
  const cloneUserRef = replacesElementUserRef
    ? makeJsxEventRefNotOverriddenByClone(elementRef, config)
    : elementRef;
  const canReuseCloneUserRef = !cloneEvents && isEventRef(cloneUserRef);
  if (canReuseCloneUserRef) {
    return cloneUserRef;
  }

  return makeEventRef(cloneEvents, cloneUserRef, 'clone');
};
