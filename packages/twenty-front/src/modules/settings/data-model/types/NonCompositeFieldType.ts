import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type ExcludeLiteral } from '~/types/ExcludeLiteral';

export type NonCompositeFieldType = ExcludeLiteral<
  FieldType,
  CompositeFieldType
>;
