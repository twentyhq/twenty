import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type PickLiteral } from '~/types/PickLiteral';

export type SettingsExcludedFieldType = PickLiteral<
  FieldType,
  'POSITION' | 'TS_VECTOR' | 'RICH_TEXT' | 'NUMERIC'
>;
