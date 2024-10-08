import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { FieldType } from '@/settings/data-model/types/FieldType';
import { ExcludeLiteral } from '~/types/ExcludeLiteral';

export type NonCompositeFieldType = ExcludeLiteral<
  FieldType,
  CompositeFieldType
>;
