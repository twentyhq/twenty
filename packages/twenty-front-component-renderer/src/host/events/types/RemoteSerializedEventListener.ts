import { type SerializedEventData } from '@/types/SerializedEventData';

export type RemoteSerializedEventListener = (
  serializedEvent: SerializedEventData,
) => void;
