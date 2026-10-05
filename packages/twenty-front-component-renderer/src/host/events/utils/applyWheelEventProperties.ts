import { isNumber } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyWheelEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.deltaX)) {
    serializedEvent.deltaX = domEvent.deltaX;
  }
  if (isNumber(domEvent.deltaY)) {
    serializedEvent.deltaY = domEvent.deltaY;
  }
  if (isNumber(domEvent.deltaZ)) {
    serializedEvent.deltaZ = domEvent.deltaZ;
  }
  if (isNumber(domEvent.deltaMode)) {
    serializedEvent.deltaMode = domEvent.deltaMode;
  }
};
