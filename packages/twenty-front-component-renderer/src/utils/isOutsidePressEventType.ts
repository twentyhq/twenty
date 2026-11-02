import { OUTSIDE_PRESS_EVENT_TYPES } from '@/constants/OutsidePressEventTypes';
import { type OutsidePressEventData } from '@/types/OutsidePressEventData';

export const isOutsidePressEventType = (
  eventType: string,
): eventType is OutsidePressEventData['type'] =>
  OUTSIDE_PRESS_EVENT_TYPES.some(
    (outsidePressEventType) => outsidePressEventType === eventType,
  );
