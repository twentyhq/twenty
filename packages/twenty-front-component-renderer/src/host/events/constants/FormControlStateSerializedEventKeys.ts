import { type SerializedEventData } from '@/types/SerializedEventData';

export const FORM_CONTROL_STATE_SERIALIZED_EVENT_KEYS = [
  'value',
  'checked',
  'selectedOptionIndexes',
  'files',
] as const satisfies readonly (keyof SerializedEventData)[];
