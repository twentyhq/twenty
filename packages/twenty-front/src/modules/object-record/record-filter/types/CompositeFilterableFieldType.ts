import { type FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export type CompositeFilterableFieldType = FilterableFieldType &
  CompositeFieldType;
