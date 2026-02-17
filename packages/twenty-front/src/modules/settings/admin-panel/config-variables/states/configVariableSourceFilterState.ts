import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const configVariableSourceFilterState =
  createStateV2<ConfigVariableSourceFilter>({
    key: 'configVariableSourceFilterState',
    defaultValue: 'all',
  });
