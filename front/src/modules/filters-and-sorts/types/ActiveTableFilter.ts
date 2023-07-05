import { TableFilterOperand } from './TableFilterOperand';
import { TableFilterType } from './TableFilterType';

export type ActiveTableFilter = {
  field: string;
  type: TableFilterType;
  value: string;
  displayValue: string;
  operand: TableFilterOperand;
};
