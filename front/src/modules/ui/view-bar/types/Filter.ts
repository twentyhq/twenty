import { FilterOperand } from './FilterOperand';
import { FilterType } from './FilterType';

export type Filter = {
  key: string;
  type: FilterType;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: FilterOperand;
};
