import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { FilterDefinition } from './FilterDefinition';

export type Filter = {
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  value: string;
  displayValue: string;
  viewFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: number | null;
  definition: FilterDefinition;
};
