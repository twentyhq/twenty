import { isBoolean, isObject, isString } from '@sniptt/guards';

import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/events/constants/MaxSerializedEventTextLength';
import { applyPasteClipboardText } from '@/host/events/utils/applyPasteClipboardText';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyInputEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  const nativeEvent = isObject(domEvent.nativeEvent)
    ? (domEvent.nativeEvent as Record<string, unknown>)
    : domEvent;

  if (isBoolean(nativeEvent.isComposing)) {
    serializedEvent.isComposing = nativeEvent.isComposing;
  }
  if (isString(domEvent.inputType)) {
    serializedEvent.inputType = domEvent.inputType;
  }
  if (isString(domEvent.data)) {
    serializedEvent.data = domEvent.data.slice(
      0,
      MAX_SERIALIZED_EVENT_TEXT_LENGTH,
    );
  }

  applyPasteClipboardText(serializedEvent, domEvent);
};
