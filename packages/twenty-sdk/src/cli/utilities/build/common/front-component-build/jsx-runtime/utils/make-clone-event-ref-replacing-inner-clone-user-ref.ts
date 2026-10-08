import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { type EventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref.type';
import { chainCloneEvents } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/chain-clone-events';
import { createEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/create-event-ref';
import { getCloneUserRefWithElementJsxEventHandlers } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-clone-user-ref-with-element-jsx-event-handlers';
import { getOuterWinningCloneEventsOf } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-outer-winning-clone-events-of';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { mergeCloneEventsOuterWinning } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/merge-clone-events-outer-winning';
import { toNonEmptyCloneEventsOrNull } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/to-non-empty-clone-events-or-null';

export const makeCloneEventRefReplacingInnerCloneUserRef = ({
  innerCloneEventRef,
  cloneConfig,
  cloneEvents,
}: {
  innerCloneEventRef: EventRef;
  cloneConfig: ElementProps;
  cloneEvents: EventHandlersByPropName | null;
}): EventRef => {
  const eventHandlersSetByInnerClones =
    getOuterWinningCloneEventsOf(innerCloneEventRef);
  const cloneUserRef = getCloneUserRefWithElementJsxEventHandlers({
    elementRef: innerCloneEventRef,
    cloneConfig,
    eventHandlersSetByInnerClones,
  });
  const chainedCloneEvents = chainCloneEvents(
    innerCloneEventRef._eventProps,
    cloneEvents,
  );
  if (chainedCloneEvents === null) {
    return makeEventRef(null, cloneUserRef, 'clone');
  }

  const outerWinningCloneEvents = toNonEmptyCloneEventsOrNull(
    mergeCloneEventsOuterWinning(eventHandlersSetByInnerClones, cloneEvents),
  );
  return createEventRef(
    chainedCloneEvents,
    cloneUserRef,
    'clone',
    outerWinningCloneEvents,
  );
};
