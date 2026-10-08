import { type SerializedEventData } from '@/types/SerializedEventData';

const CLIPBOARD_EVENT_TYPES = new Set(['copy', 'cut', 'paste']);
const CLIPBOARD_TEXT_FORMATS = new Set(['text', 'text/plain']);

export const applySerializedEventClipboardData = (
  event: object,
  eventData: SerializedEventData,
): void => {
  if (!CLIPBOARD_EVENT_TYPES.has(eventData.type)) {
    return;
  }

  const clipboardText = eventData.clipboardText ?? '';

  Object.defineProperty(event, 'clipboardData', {
    value: {
      types: clipboardText === '' ? [] : ['text/plain'],
      getData: (format: string) =>
        CLIPBOARD_TEXT_FORMATS.has(format) ? clipboardText : '',
      setData: () => undefined,
    },
    configurable: true,
    enumerable: true,
    writable: true,
  });
};
