import { SERIALIZED_EVENT_PROPERTY_KEYS } from '@/remote/elements/constants/SerializedEventPropertyKeys';
import { applySerializedEventClipboardData } from '@/remote/elements/utils/applySerializedEventClipboardData';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applySerializedEventProperties = ({
  event,
  eventData,
}: {
  event: object;
  eventData: SerializedEventData;
}): void => {
  for (const key of SERIALIZED_EVENT_PROPERTY_KEYS) {
    if (key in eventData) {
      Object.defineProperty(event, key, {
        value: eventData[key],
        configurable: true,
        enumerable: true,
        writable: true,
      });
    }
  }

  applySerializedEventClipboardData(event, eventData);
};
