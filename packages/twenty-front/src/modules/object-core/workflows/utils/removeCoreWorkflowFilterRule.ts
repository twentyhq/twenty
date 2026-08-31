import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const removeCoreWorkflowFilterRule = (
  filterSettings: FilterSettings,
  stepFilterId: string,
): FilterSettings => ({
  ...filterSettings,
  stepFilters: (filterSettings.stepFilters ?? []).filter(
    (stepFilter) => stepFilter.id !== stepFilterId,
  ),
});
