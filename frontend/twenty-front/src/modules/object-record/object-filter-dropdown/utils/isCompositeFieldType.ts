import {
  COMPOSITE_FIELD_TYPES,
  type CompositeFieldType,
} from '@/settings/data-model/types/CompositeFieldType';
import { type FieldType } from '@/settings/data-model/types/FieldType';

export const isCompositeFieldType = (
  type: FieldType,
): type is CompositeFieldType => COMPOSITE_FIELD_TYPES.includes(type as any);
