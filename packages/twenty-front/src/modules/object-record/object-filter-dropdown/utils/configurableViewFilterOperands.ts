import { ViewFilterOperand } from 'twenty-shared/types';

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
