import { SETTINGS_FIELD_TYPE_CONFIGS } from '../constants/settingsFieldType';

export type ColumnType =
  | keyof typeof SETTINGS_FIELD_TYPE_CONFIGS
  | 'DO_NOT_IMPORT';
