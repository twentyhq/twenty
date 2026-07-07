import { isNumber, isObject } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

const TOUCH_COORDINATE_KEYS = [
  'clientX',
  'clientY',
  'pageX',
  'pageY',
  'screenX',
  'screenY',
] as const;

export const applyFirstChangedTouchCoordinates = (
  serialized: SerializedEventData,
  domEvent: Record<string, unknown>,
): void => {
  const eventHasOwnCoordinates = isNumber(domEvent.clientX);

  if (eventHasOwnCoordinates || !isObject(domEvent.changedTouches)) {
    return;
  }

  const firstChangedTouch = (
    domEvent.changedTouches as Record<number, unknown>
  )[0];

  if (!isObject(firstChangedTouch)) {
    return;
  }

  const touchRecord = firstChangedTouch as Record<string, unknown>;

  for (const coordinateKey of TOUCH_COORDINATE_KEYS) {
    const coordinateValue = touchRecord[coordinateKey];

    if (isNumber(coordinateValue)) {
      serialized[coordinateKey] = coordinateValue;
    }
  }
};
