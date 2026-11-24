import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityEditorStateValidation =
  | { status: 'valid'; node: ConditionalAvailabilityNode | null }
  | {
      status: 'invalid';
      reason: 'unsupportedRule' | 'noRow' | 'invalidRows' | 'invalidNode';
    };
