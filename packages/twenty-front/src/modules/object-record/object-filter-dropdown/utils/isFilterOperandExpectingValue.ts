import { ViewFilterOperand } from 'twenty-shared/types';

export const isFilterOperandExpectingValue = (operand: ViewFilterOperand) => {
  switch (operand) {
    case ViewFilterOperand.IS_NOT_NULL:
    case ViewFilterOperand.IS_EMPTY:
    case ViewFilterOperand.IS_NOT_EMPTY:
    case ViewFilterOperand.IS_IN_PAST:
    case ViewFilterOperand.IS_IN_FUTURE:
    case ViewFilterOperand.IS_TODAY:
      return false;
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.DOES_NOT_CONTAIN:
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
    case ViewFilterOperand.IS_BEFORE:
    case ViewFilterOperand.IS_AFTER:
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_RELATIVE:
    default:
      return true;
  }
};
