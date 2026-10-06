import { isNumber } from '@sniptt/guards';

import { applyFirstChangedTouchCoordinates } from '@/host/events/utils/applyFirstChangedTouchCoordinates';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyMouseEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isNumber(domEvent.clientX)) {
    serializedEvent.clientX = domEvent.clientX;
  }
  if (isNumber(domEvent.clientY)) {
    serializedEvent.clientY = domEvent.clientY;
  }
  if (isNumber(domEvent.x)) {
    serializedEvent.x = domEvent.x;
  }
  if (isNumber(domEvent.y)) {
    serializedEvent.y = domEvent.y;
  }
  if (isNumber(domEvent.pageX)) {
    serializedEvent.pageX = domEvent.pageX;
  }
  if (isNumber(domEvent.pageY)) {
    serializedEvent.pageY = domEvent.pageY;
  }
  if (isNumber(domEvent.screenX)) {
    serializedEvent.screenX = domEvent.screenX;
  }
  if (isNumber(domEvent.screenY)) {
    serializedEvent.screenY = domEvent.screenY;
  }
  if (isNumber(domEvent.offsetX)) {
    serializedEvent.offsetX = domEvent.offsetX;
  }
  if (isNumber(domEvent.offsetY)) {
    serializedEvent.offsetY = domEvent.offsetY;
  }
  if (isNumber(domEvent.movementX)) {
    serializedEvent.movementX = domEvent.movementX;
  }
  if (isNumber(domEvent.movementY)) {
    serializedEvent.movementY = domEvent.movementY;
  }
  if (isNumber(domEvent.button)) {
    serializedEvent.button = domEvent.button;
  }
  if (isNumber(domEvent.buttons)) {
    serializedEvent.buttons = domEvent.buttons;
  }
  if (isNumber(domEvent.detail)) {
    serializedEvent.detail = domEvent.detail;
  }

  applyFirstChangedTouchCoordinates(serializedEvent, domEvent);
};
