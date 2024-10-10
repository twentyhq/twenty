import { NonCompositeFieldType } from '@/settings/data-model/types/NonCompositeFieldType';
import { SettingsExcludedFieldType } from '@/settings/data-model/types/SettingsExcludedFieldType';
import { ExcludeLiteral } from '~/types/ExcludeLiteral';

export type SettingsNonCompositeFieldType = ExcludeLiteral<
  NonCompositeFieldType,
  SettingsExcludedFieldType
>;
