import {
  type ConditionalAvailabilityCheckError,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';

export type ConditionalAvailabilityRulesValidation =
  | { status: 'valid'; node: ConditionalAvailabilityNode }
  | { status: 'invalid'; reason: 'noRow' | 'incompleteRows' }
  | {
      status: 'invalid';
      reason: 'ruleError';
      ruleError: ConditionalAvailabilityCheckError;
    };
