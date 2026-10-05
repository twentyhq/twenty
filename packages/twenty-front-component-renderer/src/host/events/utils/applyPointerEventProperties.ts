import { isBoolean, isNumber, isString } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyPointerEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.pointerId)) {
    serializedEvent.pointerId = domEvent.pointerId;
  }
  if (isString(domEvent.pointerType)) {
    serializedEvent.pointerType = domEvent.pointerType;
  }
  if (isNumber(domEvent.pressure)) {
    serializedEvent.pressure = domEvent.pressure;
  }
  if (isNumber(domEvent.tangentialPressure)) {
    serializedEvent.tangentialPressure = domEvent.tangentialPressure;
  }
  if (isNumber(domEvent.tiltX)) {
    serializedEvent.tiltX = domEvent.tiltX;
  }
  if (isNumber(domEvent.tiltY)) {
    serializedEvent.tiltY = domEvent.tiltY;
  }
  if (isNumber(domEvent.twist)) {
    serializedEvent.twist = domEvent.twist;
  }
  if (isNumber(domEvent.width)) {
    serializedEvent.width = domEvent.width;
  }
  if (isNumber(domEvent.height)) {
    serializedEvent.height = domEvent.height;
  }
  if (isBoolean(domEvent.isPrimary)) {
    serializedEvent.isPrimary = domEvent.isPrimary;
  }
};
