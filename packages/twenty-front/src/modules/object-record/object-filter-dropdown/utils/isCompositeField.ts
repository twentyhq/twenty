import {
  COMPOSITE_FIELD_TYPES,
  CompositeFieldType,
} from '@/settings/data-model/types/CompositeFieldType';
import { FieldType } from '@/settings/data-model/types/FieldType';

export const isCompositeField = (type: FieldType): type is CompositeFieldType =>
  COMPOSITE_FIELD_TYPES.includes(type as any);
