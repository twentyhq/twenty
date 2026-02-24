import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const configVariableGroupFilterState =
  createState<ConfigVariableGroupFilter>({
    key: 'configVariableGroupFilterState',
    defaultValue: 'all',
  });
