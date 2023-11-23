import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';

import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  id: string;
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  definition: FilterDefinition;
};
