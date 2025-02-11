import { NonCompositeFieldType } from '@/settings/data-model/types/NonCompositeFieldType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export type SettingsNonCompositeFieldType = Extract<
  NonCompositeFieldType,
  SettingsFieldType
>;
