import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const isFilterOperandExpectingValue = (operand: ViewFilterOperand) => {
  switch (operand) {
    case ViewFilterOperand.IsNotNull:
    case ViewFilterOperand.IsEmpty:
    case ViewFilterOperand.IsNotEmpty:
    case ViewFilterOperand.IsInPast:
    case ViewFilterOperand.IsInFuture:
    case ViewFilterOperand.IsToday:
      return false;
    case ViewFilterOperand.IsNot:
    case ViewFilterOperand.Contains:
    case ViewFilterOperand.DoesNotContain:
    case ViewFilterOperand.GreaterThan:
    case ViewFilterOperand.LessThan:
    case ViewFilterOperand.IsBefore:
    case ViewFilterOperand.IsAfter:
    case ViewFilterOperand.Is:
    case ViewFilterOperand.IsRelative:
    default:
      return true;
  }
};
