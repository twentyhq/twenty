import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';

import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  id?: string;
  fieldId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  definition: FilterDefinition;
};
