import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { ViewFilterValueType } from '@/views/types/ViewFilterValueType';
import { FilterDefinition } from './FilterDefinition';

export type Filter = {
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  value: string;
  valueType?: ViewFilterValueType;
  displayValue: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  definition: FilterDefinition;
};
