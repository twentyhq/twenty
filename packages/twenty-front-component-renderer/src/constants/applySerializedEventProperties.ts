import { applySerializedEventClipboardData } from '@/constants/applySerializedEventClipboardData';
import { type SerializedEventData } from '@/types/SerializedEventData';

const SERIALIZED_EVENT_PROPERTY_KEYS = [
  'altKey',
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'clientX',
  'clientY',
  'x',
  'y',
  'pageX',
  'pageY',
  'screenX',
  'screenY',
  'offsetX',
  'offsetY',
  'movementX',
  'movementY',
  'button',
  'buttons',
  'pointerId',
  'pointerType',
  'pressure',
  'tangentialPressure',
  'tiltX',
  'tiltY',
  'twist',
  'width',
  'height',
  'isPrimary',
  'key',
  'code',
  'repeat',
  'inputType',
  'data',
  'deltaX',
  'deltaY',
  'deltaZ',
  'deltaMode',
] as const satisfies readonly (keyof SerializedEventData)[];

export const applySerializedEventProperties = (
  event: Record<string, unknown>,
  eventData: SerializedEventData,
): void => {
  for (const key of SERIALIZED_EVENT_PROPERTY_KEYS) {
    if (key in eventData) {
      event[key] = eventData[key];
    }
  }

  applySerializedEventClipboardData(event, eventData);
};
