import { EntityFilterOperand } from './EntityFilterOperand';
import { EntityFilterType } from './EntityFilterType';

export type SelectedEntityFilter = {
  field: string;
  type: EntityFilterType;
  value: string;
  displayValue: string;
  operand: EntityFilterOperand;
};
