import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';

export type ConditionalAvailabilityEditorState =
  | { mode: 'everyone' }
  | { mode: 'customRule'; tree: ConditionalAvailabilityRowTree }
  | { mode: 'unsupportedRule' };
