import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { RecordFilterOperand } from 'twenty-shared/types';

export const CONDITIONAL_AVAILABILITY_RECORD_FILTER_OPERAND_BY_OPERATOR: Record<
  ConditionalAvailabilityOperator,
  RecordFilterOperand
> = {
  is: RecordFilterOperand.IS,
  isAnyOf: RecordFilterOperand.IS,
  isNot: RecordFilterOperand.IS_NOT,
  isNoneOf: RecordFilterOperand.IS_NOT,
  contains: RecordFilterOperand.CONTAINS,
  doesNotContain: RecordFilterOperand.DOES_NOT_CONTAIN,
  atLeast: RecordFilterOperand.GREATER_THAN_OR_EQUAL,
  atMost: RecordFilterOperand.LESS_THAN_OR_EQUAL,
  before: RecordFilterOperand.IS_BEFORE,
  after: RecordFilterOperand.IS_AFTER,
  isInPast: RecordFilterOperand.IS_IN_PAST,
  isInFuture: RecordFilterOperand.IS_IN_FUTURE,
  isEmpty: RecordFilterOperand.IS_EMPTY,
  isNotEmpty: RecordFilterOperand.IS_NOT_EMPTY,
};
