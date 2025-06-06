import { ColumnType } from '../types/ColumnType';
import { SETTINGS_FIELD_TYPE_CONFIGS } from './settingsFieldType';

export const COLUMN_TYPES: {
  value: ColumnType;
  label: string;
  description?: string;
  icon?: string;
}[] = [
  {
    value: 'DO_NOT_IMPORT',
    label: 'Do not import',
    description: 'Skip this column during import',
    icon: 'IconEyeOff',
  },
  ...Object.entries(SETTINGS_FIELD_TYPE_CONFIGS).map(([key, config]) => ({
    value: key as ColumnType,
    label: config.label,
    description: undefined,
  })),
];
