import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { createState } from 'twenty-ui/utilities';

export const configVariableSourceFilterState =
  createState<ConfigVariableSourceFilter>({
    key: 'configVariableSourceFilterState',
    defaultValue: 'all',
  });
