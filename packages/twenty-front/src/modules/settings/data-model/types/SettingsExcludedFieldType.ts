import { FieldType } from '@/settings/data-model/types/FieldType';
import { PickLiteral } from '~/types/PickLiteral';

export type SettingsExcludedFieldType = PickLiteral<
  FieldType,
  'POSITION' | 'TS_VECTOR'
>;
