import { StepLogicalOperator, type StepFilter } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { getUsableCoreAgentStepFilters } from '@/object-core/agents/utils/getUsableCoreAgentStepFilters';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const getCoreAgentFilterRuleKey = ({
  stepOutputKey,
  operand,
  value,
}: Pick<StepFilter, 'stepOutputKey' | 'operand' | 'value'>) =>
  JSON.stringify([stepOutputKey, operand, value]);

const getEffectiveCoreAgentFilter = (filterSettings: FilterSettings) => {
  const usableStepFilters = getUsableCoreAgentStepFilters(filterSettings);
  const [rootStepFilterGroup] = filterSettings.stepFilterGroups ?? [];

  return {
    ruleKeys: usableStepFilters.map(getCoreAgentFilterRuleKey).toSorted(),
    logicalOperator:
      usableStepFilters.length > 1 &&
      rootStepFilterGroup?.logicalOperator === StepLogicalOperator.OR
        ? StepLogicalOperator.OR
        : StepLogicalOperator.AND,
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
