import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export type SettingsCompositeFieldType = Extract<
  SettingsFieldType,
  CompositeFieldType
>;
