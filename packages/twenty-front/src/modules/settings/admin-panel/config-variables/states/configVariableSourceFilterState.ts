import { type ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const configVariableSourceFilterState =
  createAtomState<ConfigVariableSourceFilter>({
    key: 'configVariableSourceFilterState',
    defaultValue: 'all',
  });
