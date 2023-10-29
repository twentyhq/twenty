import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterType } from './FilterType';

export type Filter = {
  key: string;
  type: FilterType;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
};
