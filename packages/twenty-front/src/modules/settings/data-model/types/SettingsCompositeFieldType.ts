import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export type SettingsCompositeFieldType = Extract<
  SettingsFieldType,
  CompositeFieldType
>;
