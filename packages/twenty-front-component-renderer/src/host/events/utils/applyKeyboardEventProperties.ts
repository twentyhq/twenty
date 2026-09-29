import { isBoolean, isString } from '@sniptt/guards';

import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyKeyboardEventProperties = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isString(domEvent.key)) {
    serialized.key = domEvent.key;
  }
  if (isString(domEvent.code)) {
    serialized.code = domEvent.code;
  }
  if (isBoolean(domEvent.repeat)) {
    serialized.repeat = domEvent.repeat;
  }
};
