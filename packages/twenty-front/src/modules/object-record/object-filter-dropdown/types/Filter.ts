import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { FilterDefinition } from './FilterDefinition';

export type Filter = {
  id: string;
  variant?: 'default' | 'trash';
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  definition: FilterDefinition;
};
