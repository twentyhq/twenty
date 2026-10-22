import { type SerializedEventData } from '@/types/SerializedEventData';

export type CapturedPointerEventUpdate = {
  remoteElementId: string;
  eventData: SerializedEventData;
};
