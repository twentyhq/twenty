import { isBoolean, isString } from '@sniptt/guards';

import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/events/constants/MaxSerializedEventTextLength';
import { applyPasteClipboardText } from '@/host/events/utils/applyPasteClipboardText';
import { resolveNativeHostEvent } from '@/host/events/utils/resolveNativeHostEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyInputEventProperties = ({
  serializedEvent,
  domEvent,
}: {
  serializedEvent: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  const nativeEvent = resolveNativeHostEvent(domEvent) as Record<
    string,
    unknown
  >;

  if (isBoolean(nativeEvent.isComposing)) {
    serializedEvent.isComposing = nativeEvent.isComposing;
  }
  if (isString(nativeEvent.inputType)) {
    serializedEvent.inputType = nativeEvent.inputType;
  }
  if (isString(nativeEvent.data)) {
    serializedEvent.data = nativeEvent.data.slice(
      0,
      MAX_SERIALIZED_EVENT_TEXT_LENGTH,
    );
  }

  applyPasteClipboardText(serializedEvent, domEvent);
};
