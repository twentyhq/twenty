import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const configVariableGroupFilterState =
  createStateV2<ConfigVariableGroupFilter>({
    key: 'configVariableGroupFilterState',
    defaultValue: 'all',
  });
