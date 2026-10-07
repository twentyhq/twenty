import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type MakeCloneEventRefParameters } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/make-clone-event-ref-parameters.type';
import { chainCloneEvents } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/chain-clone-events';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';
import { getOuterWinningCloneEventsOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeCloneEventRefOfNonCloneElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref-of-non-clone-element-ref';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { makeJsxEventRefNotOverriddenByClone } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-jsx-event-ref-not-overridden-by-clone';
import { mergeCloneEventsOuterWinning } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRef = ({
  elementRef,
  config,
  replacesElementUserRef,
  cloneEvents,
}: MakeCloneEventRefParameters): EventRef => {
  if (!isCloneEventRef(elementRef)) {
    return makeCloneEventRefOfNonCloneElementRef({
      elementRef,
      config,
      replacesElementUserRef,
      cloneEvents,
    });
  }

  const keepsInnerCloneUserRef = !replacesElementUserRef;
  if (keepsInnerCloneUserRef && !cloneEvents) {
    return elementRef;
  }

  const innerCloneEvents = elementRef._eventProps;
  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(
      getOuterWinningCloneEventsOf(elementRef),
      cloneEvents,
    ),
  );
  const hasInnerOuterWinningCloneEvents = !!elementRef._outerWinningCloneEvents;
  if (keepsInnerCloneUserRef && !hasInnerOuterWinningCloneEvents) {
    return makeEventRef(outerWinningCloneEvents, elementRef._userRef, 'clone');
  }

  if (keepsInnerCloneUserRef) {
    return createEventRef(
      mergeCloneEventsOuterWinning(innerCloneEvents, cloneEvents),
      elementRef._userRef,
      'clone',
      outerWinningCloneEvents,
    );
  }

  const cloneUserRef = makeJsxEventRefNotOverriddenByClone(elementRef, config);
  const chainedCloneEvents = chainCloneEvents(innerCloneEvents, cloneEvents);
  if (chainedCloneEvents === null) {
    return makeEventRef(null, cloneUserRef, 'clone');
  }

  return createEventRef(
    chainedCloneEvents,
    cloneUserRef,
    'clone',
    outerWinningCloneEvents,
  );
};
