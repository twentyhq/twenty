import { type SerializedEventData } from '@/types/SerializedEventData';

export const SERIALIZED_EVENT_TARGET_PROPERTY_KEYS = [
  'value',
  'checked',
  'files',
  'scrollTop',
  'scrollLeft',
  'currentTime',
  'duration',
  'paused',
  'ended',
  'volume',
  'muted',
  'playbackRate',
] as const satisfies readonly (keyof SerializedEventData)[];
