import { fastDeepEqual } from 'twenty-shared/utils';

import { getUsableCoreAgentStepFilters } from '@/object-core/agents/utils/getUsableCoreAgentStepFilters';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const getEffectiveCoreAgentFilter = (filterSettings: FilterSettings) => {
  const usableStepFilters = getUsableCoreAgentStepFilters(filterSettings);

  return {
    rules: usableStepFilters.map(({ stepOutputKey, operand, value }) => ({
      stepOutputKey,
      operand,
      value,
    })),
    logicalOperator:
      usableStepFilters.length > 1
        ? filterSettings.stepFilterGroups?.[0]?.logicalOperator
        : undefined,
  };
};

export const areCoreAgentFilterSettingsEquivalent = ({
  filterSettings,
  otherFilterSettings,
}: {
  filterSettings: FilterSettings;
  otherFilterSettings: FilterSettings;
}): boolean =>
  fastDeepEqual(
    getEffectiveCoreAgentFilter(filterSettings),
    getEffectiveCoreAgentFilter(otherFilterSettings),
  );
