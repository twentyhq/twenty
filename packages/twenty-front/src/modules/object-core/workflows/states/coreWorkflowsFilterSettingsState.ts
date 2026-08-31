import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const CORE_WORKFLOWS_FILTER_INSTANCE_ID = 'core-workflows-filters';

export const coreWorkflowsFilterSettingsState = createAtomState<FilterSettings>(
  {
    key: 'coreWorkflowsFilterSettingsState',
    defaultValue: {},
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (filterSettings) =>
      typeof filterSettings === 'object' && filterSettings !== null,
  },
);
