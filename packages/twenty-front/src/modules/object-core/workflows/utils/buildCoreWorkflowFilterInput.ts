import { MAX_CORE_WORKFLOW_FILTER_RULES } from 'twenty-shared/constants';
import { StepLogicalOperator, type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND } from '@/object-core/workflows/constants/CoreWorkflowFilterOperandByViewFilterOperand';
import { findCoreObjectFilterField } from '@/object-core/filters/utils/findCoreObjectFilterField';
import { isUsableCoreObjectFilterRule } from '@/object-core/filters/utils/isUsableCoreObjectFilterRule';
import { CORE_WORKFLOW_FILTER_FIELDS } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import {
  CoreWorkflowFilterLogicalOperator,
  type CoreWorkflowFilterInput,
  type CoreWorkflowFilterRuleInput,
} from '~/generated/graphql';

const toCoreWorkflowFilterRule = ({
  stepFilter,
  timezone,
}: {
  stepFilter: StepFilter;
  timezone: string | undefined;
}): CoreWorkflowFilterRuleInput | undefined => {
  const selectedField = findCoreObjectFilterField({
    filterFields: CORE_WORKFLOW_FILTER_FIELDS,
    fieldKey: stepFilter.stepOutputKey,
  });
  const operand =
    CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND[stepFilter.operand];

  if (!isDefined(selectedField) || !isDefined(operand)) {
    return undefined;
  }

  const expectsValue = isRecordFilterOperandExpectingValue(stepFilter.operand);

  return {
    fieldKey: selectedField.key,
    operand,
    value: expectsValue ? stepFilter.value : null,
    timezone:
      selectedField.filterType === 'DATE_TIME' && isDefined(timezone)
        ? timezone
        : null,
  };
};

export const buildCoreWorkflowFilterInput = ({
  filterSettings,
  timezone,
}: {
  filterSettings: FilterSettings;
  timezone?: string;
}): CoreWorkflowFilterInput | undefined => {
  const rules = (filterSettings.stepFilters ?? [])
    .filter((stepFilter) =>
      isUsableCoreObjectFilterRule({
        stepFilter,
        filterFields: CORE_WORKFLOW_FILTER_FIELDS,
      }),
    )
    .slice(0, MAX_CORE_WORKFLOW_FILTER_RULES)
    .map((stepFilter) => toCoreWorkflowFilterRule({ stepFilter, timezone }))
    .filter(isDefined);

  if (rules.length === 0) {
    return undefined;
  }

  const [rootStepFilterGroup] = filterSettings.stepFilterGroups ?? [];

  return {
    logicalOperator:
      rootStepFilterGroup?.logicalOperator === StepLogicalOperator.OR
        ? CoreWorkflowFilterLogicalOperator.OR
        : CoreWorkflowFilterLogicalOperator.AND,
    rules,
  };
};
