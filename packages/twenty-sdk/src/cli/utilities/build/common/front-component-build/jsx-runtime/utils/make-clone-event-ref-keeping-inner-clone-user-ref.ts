import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';
import { getOuterWinningCloneEventsOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { mergeCloneEventsOuterWinning } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRefKeepingInnerCloneUserRef = ({
  innerCloneEventRef,
  cloneEvents,
}: {
  innerCloneEventRef: EventRef;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  if (cloneEvents === null) {
    return innerCloneEventRef;
  }

  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(
      getOuterWinningCloneEventsOf(innerCloneEventRef),
      cloneEvents,
    ),
  );
  const hasInnerOuterWinningCloneEvents =
    innerCloneEventRef._outerWinningCloneEvents != null;
  if (!hasInnerOuterWinningCloneEvents) {
    return makeEventRef(
      outerWinningCloneEvents,
      innerCloneEventRef._userRef,
      'clone',
    );
  }

  return createEventRef(
    mergeCloneEventsOuterWinning(innerCloneEventRef._eventProps, cloneEvents),
    innerCloneEventRef._userRef,
    'clone',
    outerWinningCloneEvents,
  );
};
