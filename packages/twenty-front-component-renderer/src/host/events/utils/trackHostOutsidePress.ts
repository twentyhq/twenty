import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OUTSIDE_PRESS_EVENT_TYPES } from '@/constants/OutsidePressEventTypes';
import { createCapturedGestureEventFilter } from '@/host/events/utils/createCapturedGestureEventFilter';
import { isPressLessClick } from '@/host/events/utils/isPressLessClick';
import { isScrollbarPress } from '@/host/events/utils/isScrollbarPress';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { type OutsidePressEventData } from '@/types/OutsidePressEventData';
import { isOutsidePressEventType } from '@/utils/isOutsidePressEventType';

export const trackHostOutsidePress = ({
  documentTarget,
  findRemoteElementIdContainingNode,
  hasActivePointerCaptureForEvent,
  pushOutsidePressEvent,
}: {
  documentTarget: Document;
  findRemoteElementIdContainingNode: FindRemoteElementIdContainingNode;
  hasActivePointerCaptureForEvent: (event: object) => boolean;
  pushOutsidePressEvent: (eventData: OutsidePressEventData) => void;
}): (() => void) => {
  const isCapturedGestureEvent = createCapturedGestureEventFilter(
    hasActivePointerCaptureForEvent,
  );

  const handleOutsidePress = (event: MouseEvent) => {
    if (
      !isOutsidePressEventType(event.type) ||
      isCapturedGestureEvent(event) ||
      isPressLessClick(event) ||
      isDefined(findRemoteElementIdContainingNode(event.target)) ||
      event
        .composedPath()
        .some((target) =>
          isDefined(findRemoteElementIdContainingNode(target)),
        ) ||
      isScrollbarPress(event)
    ) {
      return;
    }

    pushOutsidePressEvent({
      type: event.type,
      button: event.button,
      buttons: event.buttons,
      detail: event.detail,
      pointerType:
        'pointerType' in event && isString(event.pointerType)
          ? event.pointerType
          : 'mouse',
    });
  };

  for (const eventType of OUTSIDE_PRESS_EVENT_TYPES) {
    documentTarget.addEventListener(eventType, handleOutsidePress, true);
  }

  return () => {
    for (const eventType of OUTSIDE_PRESS_EVENT_TYPES) {
      documentTarget.removeEventListener(eventType, handleOutsidePress, true);
    }
  };
};
