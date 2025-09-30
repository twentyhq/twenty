import { ViewFilterOperand as ViewFilterOperandShared } from 'twenty-shared/types';

import { ViewFilterOperand } from 'src/engine/core-modules/view/enums/view-filter-operand';

export const convertViewFilterOperand = (
  operand: ViewFilterOperand,
): ViewFilterOperandShared => {
  switch (operand) {
    case ViewFilterOperand.IS:
      return ViewFilterOperandShared.Is;
    case ViewFilterOperand.IS_NOT_NULL:
      return ViewFilterOperandShared.IsNotNull;
    case ViewFilterOperand.IS_NOT:
      return ViewFilterOperandShared.IsNot;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return ViewFilterOperandShared.LessThanOrEqual;
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return ViewFilterOperandShared.GreaterThanOrEqual;
    case ViewFilterOperand.IS_BEFORE:
      return ViewFilterOperandShared.IsBefore;
    case ViewFilterOperand.IS_AFTER:
      return ViewFilterOperandShared.IsAfter;
    case ViewFilterOperand.CONTAINS:
      return ViewFilterOperandShared.Contains;
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return ViewFilterOperandShared.DoesNotContain;
    case ViewFilterOperand.IS_EMPTY:
      return ViewFilterOperandShared.IsEmpty;
    case ViewFilterOperand.IS_NOT_EMPTY:
      return ViewFilterOperandShared.IsNotEmpty;
    case ViewFilterOperand.IS_RELATIVE:
      return ViewFilterOperandShared.IsRelative;
    case ViewFilterOperand.IS_IN_PAST:
      return ViewFilterOperandShared.IsInPast;
    case ViewFilterOperand.IS_IN_FUTURE:
      return ViewFilterOperandShared.IsInFuture;
    case ViewFilterOperand.IS_TODAY:
      return ViewFilterOperandShared.IsToday;
    case ViewFilterOperand.VECTOR_SEARCH:
      return ViewFilterOperandShared.VectorSearch;
    default:
      throw new Error(`Invalid view filter operand: ${operand}`);
  }
};
