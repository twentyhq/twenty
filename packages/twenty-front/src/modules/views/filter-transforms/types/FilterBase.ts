import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export type FilterBase<T extends FilterableFieldType, V> = {
  definition: FilterDefinition & {
    type: T;
  };
  value: V;
  id: string;
  variant?: 'default' | 'danger';
  fieldMetadataId: string;
  displayValue: string;
  viewFilterGroupId?: string;
  displayAvatarUrl?: string;
  operand: ViewFilterOperand;
  positionInViewFilterGroup?: number | null;
};
