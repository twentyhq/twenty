import { isNumber } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyWheelEventProperties = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.deltaX)) {
    serialized.deltaX = domEvent.deltaX;
  }
  if (isNumber(domEvent.deltaY)) {
    serialized.deltaY = domEvent.deltaY;
  }
  if (isNumber(domEvent.deltaZ)) {
    serialized.deltaZ = domEvent.deltaZ;
  }
  if (isNumber(domEvent.deltaMode)) {
    serialized.deltaMode = domEvent.deltaMode;
  }
};
