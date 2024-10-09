import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export type CompositeFilterableFieldType = FilterableFieldType &
  CompositeFieldType;
