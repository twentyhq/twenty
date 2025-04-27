import { CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { FILTERABLE_FIELD_TYPES } from '@/object-record/record-filter/types/FilterableFieldType';
import { COMPOSITE_FIELD_TYPES } from '@/settings/data-model/types/CompositeFieldType';
import { FieldType } from '@/settings/data-model/types/FieldType';

export const isCompositeFilterableFieldType = (
  type: FieldType,
): type is CompositeFilterableFieldType =>
  FILTERABLE_FIELD_TYPES.includes(type as any) &&
  COMPOSITE_FIELD_TYPES.includes(type as any);
