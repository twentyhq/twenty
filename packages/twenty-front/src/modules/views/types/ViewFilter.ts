import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { ViewFilterType } from '@/views/types/ViewFilterType';
import { ViewFilterOperand } from './ViewFilterOperand';

export type ViewFilter = {
  __typename: 'ViewFilter';
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  type: ViewFilterType;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  createdAt?: string;
  updatedAt?: string;
  viewId?: string;
  viewFilterGroupId?: string;
  positionInViewFilterGroup?: number | null;
  definition?: FilterDefinition;
};
