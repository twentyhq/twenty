import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilter,
} from 'twenty-shared/types';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { isUsableCoreObjectFilterRule } from '@/object-core/filters/utils/isUsableCoreObjectFilterRule';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const isCoreAgentMatchingRule = ({
  agent,
  stepFilter,
}: {
  agent: CoreAgent;
  stepFilter: StepFilter;
}): boolean => {
  if (stepFilter.stepOutputKey === 'IS_SYSTEM') {
    return agent.isSystem === (stepFilter.value === 'true');
  }

  const normalizedLabel = normalizeSearchText(agent.label.trim());
  const normalizedValue = normalizeSearchText(stepFilter.value.trim());

  switch (stepFilter.operand) {
    case ViewFilterOperand.CONTAINS:
      return normalizedLabel.includes(normalizedValue);
    case ViewFilterOperand.DOES_NOT_CONTAIN:
      return !normalizedLabel.includes(normalizedValue);
    case ViewFilterOperand.IS_EMPTY:
      return normalizedLabel === '';
    case ViewFilterOperand.IS_NOT_EMPTY:
      return normalizedLabel !== '';
    default:
      return true;
  }
};

export const isCoreAgentMatchingFilterSettings = ({
  agent,
  filterSettings,
}: {
  agent: CoreAgent;
  filterSettings: FilterSettings;
}): boolean => {
  const usableStepFilters = (filterSettings.stepFilters ?? []).filter(
    (stepFilter) =>
      isUsableCoreObjectFilterRule({
        stepFilter,
        filterFields: CORE_AGENT_FILTER_FIELDS,
      }),
  );

  if (usableStepFilters.length === 0) {
    return true;
  }

  const [rootStepFilterGroup] = filterSettings.stepFilterGroups ?? [];

  const isMatchingStepFilter = (stepFilter: StepFilter) =>
    isCoreAgentMatchingRule({ agent, stepFilter });

  return rootStepFilterGroup?.logicalOperator === StepLogicalOperator.OR
    ? usableStepFilters.some(isMatchingStepFilter)
    : usableStepFilters.every(isMatchingStepFilter);
};
