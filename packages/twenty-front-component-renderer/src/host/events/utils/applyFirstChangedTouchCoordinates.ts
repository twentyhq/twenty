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
  serializedEvent: SerializedEventData,
  domEvent: Record<string, unknown>,
): void => {
  const domEventHasDirectCoordinates = isNumber(domEvent.clientX);

  if (domEventHasDirectCoordinates || !isObject(domEvent.changedTouches)) {
    return;
  }

  const firstChangedTouch = (
    domEvent.changedTouches as Record<number, unknown>
  )[0];

  if (!isObject(firstChangedTouch)) {
    return;
  }

  for (const coordinateKey of TOUCH_COORDINATE_KEYS) {
    const coordinateValue = (firstChangedTouch as Record<string, unknown>)[
      coordinateKey
    ];

    if (isNumber(coordinateValue)) {
      serializedEvent[coordinateKey] = coordinateValue;
    }
  }
};
