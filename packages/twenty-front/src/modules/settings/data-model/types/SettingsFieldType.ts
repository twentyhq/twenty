import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsExcludedFieldType } from '@/settings/data-model/types/SettingsExcludedFieldType';
import { type ExcludeLiteral } from '~/types/ExcludeLiteral';

export type SettingsFieldType = ExcludeLiteral<
  FieldType,
  SettingsExcludedFieldType
>;
