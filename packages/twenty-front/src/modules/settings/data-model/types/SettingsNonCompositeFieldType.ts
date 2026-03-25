import { type NonCompositeFieldType } from '@/settings/data-model/types/NonCompositeFieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export type SettingsNonCompositeFieldType = Extract<
  NonCompositeFieldType,
  SettingsFieldType
>;
