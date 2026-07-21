import { isFunction, isObject, isString } from '@sniptt/guards';

import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/constants/MaxSerializedEventTextLength';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyPasteClipboardText = (
  serializedEvent: SerializedEventData,
  domEvent: Record<string, unknown>,
): void => {
  if (serializedEvent.type !== 'paste') {
    return;
  }

  const clipboardData = domEvent.clipboardData;

  if (!isObject(clipboardData)) {
    return;
  }

  const getData = (clipboardData as Record<string, unknown>).getData;

  if (!isFunction(getData)) {
    return;
  }

  const clipboardText = getData.call(clipboardData, 'text');

  if (isString(clipboardText)) {
    serializedEvent.clipboardText = clipboardText.slice(
      0,
      MAX_SERIALIZED_EVENT_TEXT_LENGTH,
    );
  }
};
