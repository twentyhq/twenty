import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const configurableViewFilterOperands = new Set<ViewFilterOperand>([
  ViewFilterOperand.Is,
  ViewFilterOperand.IsNotNull,
  ViewFilterOperand.IsNot,
  ViewFilterOperand.LessThanOrEqual,
  ViewFilterOperand.GreaterThanOrEqual,
  ViewFilterOperand.IsBefore,
  ViewFilterOperand.IsAfter,
  ViewFilterOperand.Contains,
  ViewFilterOperand.DoesNotContain,
  ViewFilterOperand.IsRelative,
]);
