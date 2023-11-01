import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';

import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  id?: string;
  fieldId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  definition: FilterDefinition;
};
