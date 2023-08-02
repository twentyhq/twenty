import { FilterOperand } from './FilterOperand';
import { FilterType } from './FilterType';

export type Filter = {
  field: string;
  type: FilterType;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: FilterOperand;
};
