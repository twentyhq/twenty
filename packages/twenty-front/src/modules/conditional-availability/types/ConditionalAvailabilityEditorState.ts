import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';

export type ConditionalAvailabilityEditorState =
  | { mode: 'everyone' }
  | { mode: 'customRule'; rowTree: ConditionalAvailabilityRowGroup }
  | { mode: 'unsupportedRule' };
