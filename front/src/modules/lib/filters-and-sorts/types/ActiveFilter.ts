import { FilterOperand } from './FilterOperand';
import { FilterType } from './FilterType';

export type ActiveFilter = {
  field: string;
  type: FilterType;
  value: string;
  displayValue: string;
  operand: FilterOperand;
};
