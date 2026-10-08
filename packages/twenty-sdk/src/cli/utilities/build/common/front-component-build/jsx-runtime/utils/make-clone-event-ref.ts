import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { type UserRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/user-ref.type';
import { chainCloneEvents } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/chain-clone-events';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';
import { getOuterWinningCloneEventsOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { isCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-clone-event-ref';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { mergeCloneEventsOuterWinning } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRef = ({
  elementRef,
  configRef,
  overridesElementRef,
  cloneEvents,
}: {
  elementRef: UserRef;
  configRef: UserRef;
  overridesElementRef: boolean;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  if (!isCloneEventRef(elementRef)) {
    const cloneUserRef = overridesElementRef ? configRef : elementRef;
    return makeEventRef(cloneEvents, cloneUserRef, 'clone');
  }

  const innerCloneEvents = elementRef._eventProps;
  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(
      getOuterWinningCloneEventsOf(elementRef),
      cloneEvents,
    ),
  );
  const keepsInnerCloneUserRef =
    !overridesElementRef || configRef === elementRef;
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

  const chainedCloneEvents = chainCloneEvents(innerCloneEvents, cloneEvents);
  if (chainedCloneEvents === null) {
    return makeEventRef(null, configRef, 'clone');
  }

  return createEventRef(
    chainedCloneEvents,
    configRef,
    'clone',
    outerWinningCloneEvents,
  );
};
