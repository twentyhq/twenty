import { isNumber } from '@sniptt/guards';

import { applyFirstChangedTouchCoordinates } from '@/host/events/utils/applyFirstChangedTouchCoordinates';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyMouseEventProperties = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.clientX)) {
    serialized.clientX = domEvent.clientX;
  }
  if (isNumber(domEvent.clientY)) {
    serialized.clientY = domEvent.clientY;
  }
  if (isNumber(domEvent.x)) {
    serialized.x = domEvent.x;
  }
  if (isNumber(domEvent.y)) {
    serialized.y = domEvent.y;
  }
  if (isNumber(domEvent.pageX)) {
    serialized.pageX = domEvent.pageX;
  }
  if (isNumber(domEvent.pageY)) {
    serialized.pageY = domEvent.pageY;
  }
  if (isNumber(domEvent.screenX)) {
    serialized.screenX = domEvent.screenX;
  }
  if (isNumber(domEvent.screenY)) {
    serialized.screenY = domEvent.screenY;
  }
  if (isNumber(domEvent.offsetX)) {
    serialized.offsetX = domEvent.offsetX;
  }
  if (isNumber(domEvent.offsetY)) {
    serialized.offsetY = domEvent.offsetY;
  }
  if (isNumber(domEvent.movementX)) {
    serialized.movementX = domEvent.movementX;
  }
  if (isNumber(domEvent.movementY)) {
    serialized.movementY = domEvent.movementY;
  }
  if (isNumber(domEvent.button)) {
    serialized.button = domEvent.button;
  }
  if (isNumber(domEvent.buttons)) {
    serialized.buttons = domEvent.buttons;
  }
  if (isNumber(domEvent.detail)) {
    serialized.detail = domEvent.detail;
  }

  applyFirstChangedTouchCoordinates(serialized, domEvent);
};
