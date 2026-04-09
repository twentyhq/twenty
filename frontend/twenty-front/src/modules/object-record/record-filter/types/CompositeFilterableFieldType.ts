import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { type FilterableFieldType } from 'twenty-shared/types';

export type CompositeFilterableFieldType = FilterableFieldType &
  CompositeFieldType;
