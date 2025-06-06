import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '../constants/settingsFieldType';

export type CompositeFieldType =
  keyof typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS;
