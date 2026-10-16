import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { type ThemeColor } from 'twenty-ui/theme';

type ConfigVariableSourceOption = {
  value: ConfigVariableSourceFilter;
  label: MessageDescriptor;
  color: ThemeColor | 'transparent';
};

export const CONFIG_VARIABLE_SOURCE_OPTIONS: ConfigVariableSourceOption[] = [
  { value: 'all', label: msg`All Sources`, color: 'transparent' },
  { value: 'database', label: msg`Database`, color: 'blue' },
  { value: 'environment', label: msg`Environment`, color: 'green' },
  { value: 'default', label: msg`Default`, color: 'gray' },
];
