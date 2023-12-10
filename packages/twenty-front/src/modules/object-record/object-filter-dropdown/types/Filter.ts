import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterDefinition } from './FilterDefinition';

export type Filter = {
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  definition: FilterDefinition;
};
