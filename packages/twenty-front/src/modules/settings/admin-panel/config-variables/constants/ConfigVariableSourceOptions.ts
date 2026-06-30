import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { type ThemeColor } from 'twenty-ui/theme';

type ConfigVariableSourceOption = {
  value: ConfigVariableSourceFilter;
  label: string;
  color: ThemeColor | 'transparent';
};

export const CONFIG_VARIABLE_SOURCE_OPTIONS: ConfigVariableSourceOption[] = [
  { value: 'all', label: 'All Sources', color: 'transparent' },
  { value: 'database', label: 'Database', color: 'blue' },
  { value: 'environment', label: 'Environment', color: 'green' },
  { value: 'default', label: 'Default', color: 'gray' },
];
