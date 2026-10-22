import { type SerializedEventData } from '@/types/SerializedEventData';

export const SERIALIZED_EVENT_TARGET_PROPERTY_KEYS = [
  'value',
  'checked',
  'files',
  'currentTime',
  'duration',
  'paused',
  'ended',
  'volume',
  'muted',
  'playbackRate',
] as const satisfies readonly (keyof SerializedEventData)[];
