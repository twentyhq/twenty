import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const CORE_AGENTS_FILTER_INSTANCE_ID = 'core-agents-filters';

export const coreAgentsFilterSettingsState = createAtomState<FilterSettings>({
  key: 'coreAgentsFilterSettingsState',
  defaultValue: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (filterSettings) =>
    typeof filterSettings === 'object' &&
    isDefined(filterSettings) &&
    (!('stepFilters' in filterSettings) ||
      Array.isArray(filterSettings.stepFilters)) &&
    (!('stepFilterGroups' in filterSettings) ||
      Array.isArray(filterSettings.stepFilterGroups)),
});
