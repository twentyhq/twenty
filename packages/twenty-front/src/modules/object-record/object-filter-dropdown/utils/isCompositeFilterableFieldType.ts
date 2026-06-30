import { type CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { COMPOSITE_FIELD_TYPES } from '@/settings/data-model/types/CompositeFieldType';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { FILTERABLE_FIELD_TYPES } from 'twenty-shared/types';

export const isCompositeFilterableFieldType = (
  type: FieldType,
): type is CompositeFilterableFieldType =>
  FILTERABLE_FIELD_TYPES.includes(type as any) &&
  COMPOSITE_FIELD_TYPES.includes(type as any);
