import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export type ConditionalAvailabilityEditorStateValidation =
  | { status: 'valid'; node: ConditionalAvailabilityNode | null }
  | { status: 'invalid' };
