import { ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { ThemeColor } from 'twenty-ui/theme';

type ConfigVariableSourceOption = {
  value: ConfigVariableSourceFilter;
  label: string;
  color: ThemeColor | 'transparent';
};

export const ConfigVariableSourceOptions: ConfigVariableSourceOption[] = [
  { value: 'all', label: 'All Sources', color: 'transparent' },
  { value: 'database', label: 'Database', color: 'blue' },
  { value: 'environment', label: 'Environment', color: 'green' },
  { value: 'default', label: 'Default', color: 'gray' },
];
