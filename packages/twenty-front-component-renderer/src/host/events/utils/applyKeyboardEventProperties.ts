import { isBoolean, isString } from '@sniptt/guards';

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
  if (isBoolean(domEvent.repeat)) {
    serializedEvent.repeat = domEvent.repeat;
  }
};
