import { serializeEvent } from '@/host/events/utils/serializeEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const wrapEventHandler =
  (handler: (detail: SerializedEventData) => void) =>
  (event: unknown): void => {
    handler(serializeEvent(event));
  };
