import { isBoolean, isNumber, isString } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyKeyboardEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isString(domEvent.key)) {
    serializedEvent.key = domEvent.key;
  }
  if (isString(domEvent.code)) {
    serializedEvent.code = domEvent.code;
  }
  if (isNumber(domEvent.which)) {
    serializedEvent.which = domEvent.which;
  }
  if (isNumber(domEvent.keyCode)) {
    serializedEvent.keyCode = domEvent.keyCode;
  }
  if (isBoolean(domEvent.repeat)) {
    serializedEvent.repeat = domEvent.repeat;
  }
};
