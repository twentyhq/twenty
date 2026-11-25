import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';

export type ConditionalAvailabilityEditorState =
  | { mode: 'everyone' }
  | { mode: 'customRule'; filterGroup: ConditionalAvailabilityFilterGroup }
  | { mode: 'unsupportedRule' };
