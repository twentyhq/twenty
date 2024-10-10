import { FieldType } from '@/settings/data-model/types/FieldType';
import { SettingsExcludedFieldType } from '@/settings/data-model/types/SettingsExcludedFieldType';
import { ExcludeLiteral } from '~/types/ExcludeLiteral';

export type SettingsFieldType = ExcludeLiteral<
  FieldType,
  SettingsExcludedFieldType
>;
