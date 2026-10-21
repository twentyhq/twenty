import { CORE_WORKFLOWS_DEFAULT_FILTER_SETTINGS } from '@/object-core/workflows/constants/CoreWorkflowsDefaultFilterSettings';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const CORE_WORKFLOWS_FILTER_INSTANCE_ID = 'core-workflows-filters';

export const coreWorkflowsFilterSettingsState = createAtomState<FilterSettings>(
  {
    // Renamed so filters saved before the IS_SYSTEM default rule are dropped
    key: 'coreWorkflowsFilterSettingsWithSystemRuleState',
    defaultValue: CORE_WORKFLOWS_DEFAULT_FILTER_SETTINGS,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (filterSettings) =>
      typeof filterSettings === 'object' &&
      filterSettings !== null &&
      (!('stepFilters' in filterSettings) ||
        Array.isArray(filterSettings.stepFilters)) &&
      (!('stepFilterGroups' in filterSettings) ||
        Array.isArray(filterSettings.stepFilterGroups)),
  },
);
