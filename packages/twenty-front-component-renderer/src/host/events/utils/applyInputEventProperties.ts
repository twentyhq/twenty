import { isString } from '@sniptt/guards';

import { MAX_SERIALIZED_EVENT_TEXT_LENGTH } from '@/host/events/constants/MaxSerializedEventTextLength';
import { applyPasteClipboardText } from '@/host/events/utils/applyPasteClipboardText';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyInputEventProperties = ({
  serialized,
  domEvent,
}: {
  serialized: SerializedEventData;
  domEvent: Record<string, unknown>;
}): void => {
  if (isString(domEvent.inputType)) {
    serialized.inputType = domEvent.inputType;
  }
  if (isString(domEvent.data)) {
    serialized.data = domEvent.data.slice(0, MAX_SERIALIZED_EVENT_TEXT_LENGTH);
  }

  applyPasteClipboardText(serialized, domEvent);
};
