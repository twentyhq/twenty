import { type ConfigVariableGroupFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableGroupFilter';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const configVariableGroupFilterState =
  createAtomState<ConfigVariableGroupFilter>({
    key: 'configVariableGroupFilterState',
    defaultValue: 'all',
  });
