import { type ViewFilterOperand } from 'twenty-shared/types';

export type FormulaAggregateCondition = {
  id: string;
  fieldName: string;
  operand: ViewFilterOperand;
  value: string;
};
