import type { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import {
  RowLevelPermissionPredicateOperand,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const mapRLSOperandToRecordFilterOperand = (
  operand: RowLevelPermissionPredicateOperand,
): RecordFilterOperand => {
  switch (operand) {
    case RowLevelPermissionPredicateOperand.IS:
      return ViewFilterOperand.IS;
    case RowLevelPermissionPredicateOperand.IS_NOT_NULL:
      return ViewFilterOperand.IS_NOT_NULL;
    case RowLevelPermissionPredicateOperand.IS_NOT:
      return ViewFilterOperand.IS_NOT;
    case RowLevelPermissionPredicateOperand.LESS_THAN_OR_EQUAL:
      return ViewFilterOperand.LESS_THAN_OR_EQUAL;
    case RowLevelPermissionPredicateOperand.GREATER_THAN_OR_EQUAL:
      return ViewFilterOperand.GREATER_THAN_OR_EQUAL;
    case RowLevelPermissionPredicateOperand.IS_BEFORE:
      return ViewFilterOperand.IS_BEFORE;
    case RowLevelPermissionPredicateOperand.IS_AFTER:
      return ViewFilterOperand.IS_AFTER;
    case RowLevelPermissionPredicateOperand.CONTAINS:
      return ViewFilterOperand.CONTAINS;
    case RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN:
      return ViewFilterOperand.DOES_NOT_CONTAIN;
    case RowLevelPermissionPredicateOperand.IS_EMPTY:
      return ViewFilterOperand.IS_EMPTY;
    case RowLevelPermissionPredicateOperand.IS_NOT_EMPTY:
      return ViewFilterOperand.IS_NOT_EMPTY;
    case RowLevelPermissionPredicateOperand.IS_RELATIVE:
      return ViewFilterOperand.IS_RELATIVE;
    case RowLevelPermissionPredicateOperand.IS_IN_PAST:
      return ViewFilterOperand.IS_IN_PAST;
    case RowLevelPermissionPredicateOperand.IS_IN_FUTURE:
      return ViewFilterOperand.IS_IN_FUTURE;
    case RowLevelPermissionPredicateOperand.IS_TODAY:
      return ViewFilterOperand.IS_TODAY;
    case RowLevelPermissionPredicateOperand.VECTOR_SEARCH:
      return ViewFilterOperand.VECTOR_SEARCH;
    default:
      assertUnreachable(operand);
  }
};
