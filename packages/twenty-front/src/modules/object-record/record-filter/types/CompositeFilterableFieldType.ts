import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export type CompositeFilterableFieldType = FilterableFieldType &
  CompositeFieldType;
