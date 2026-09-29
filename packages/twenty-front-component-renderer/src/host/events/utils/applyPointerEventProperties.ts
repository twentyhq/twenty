import { isBoolean, isNumber, isString } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyPointerEventProperties = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.pointerId)) {
    serialized.pointerId = domEvent.pointerId;
  }
  if (isString(domEvent.pointerType)) {
    serialized.pointerType = domEvent.pointerType;
  }
  if (isNumber(domEvent.pressure)) {
    serialized.pressure = domEvent.pressure;
  }
  if (isNumber(domEvent.tangentialPressure)) {
    serialized.tangentialPressure = domEvent.tangentialPressure;
  }
  if (isNumber(domEvent.tiltX)) {
    serialized.tiltX = domEvent.tiltX;
  }
  if (isNumber(domEvent.tiltY)) {
    serialized.tiltY = domEvent.tiltY;
  }
  if (isNumber(domEvent.twist)) {
    serialized.twist = domEvent.twist;
  }
  if (isNumber(domEvent.width)) {
    serialized.width = domEvent.width;
  }
  if (isNumber(domEvent.height)) {
    serialized.height = domEvent.height;
  }
  if (isBoolean(domEvent.isPrimary)) {
    serialized.isPrimary = domEvent.isPrimary;
  }
};
