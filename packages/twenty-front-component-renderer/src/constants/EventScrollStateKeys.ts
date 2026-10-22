import { type SerializedEventData } from '@/types/SerializedEventData';

export const EVENT_SCROLL_STATE_KEYS = [
  'scrollTop',
  'scrollLeft',
  'scrollWidth',
  'clientWidth',
] as const satisfies readonly (keyof SerializedEventData)[];
