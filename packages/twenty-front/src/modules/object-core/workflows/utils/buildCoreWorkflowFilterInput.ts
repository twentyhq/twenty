import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import {
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  type CoreWorkflowFilterInput,
  type CoreWorkflowFilterRuleInput,
} from '~/generated/graphql';

const CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND: Partial<
  Record<ViewFilterOperand, CoreWorkflowFilterOperand>
> = {
  [ViewFilterOperand.CONTAINS]: CoreWorkflowFilterOperand.CONTAINS,
  [ViewFilterOperand.DOES_NOT_CONTAIN]:
    CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperand.IS]: CoreWorkflowFilterOperand.IS,
  [ViewFilterOperand.IS_NOT]: CoreWorkflowFilterOperand.IS_NOT,
  [ViewFilterOperand.IS_EMPTY]: CoreWorkflowFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IS_NOT_EMPTY]: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.IS_BEFORE]: CoreWorkflowFilterOperand.IS_BEFORE,
  [ViewFilterOperand.IS_AFTER]: CoreWorkflowFilterOperand.IS_AFTER,
  [ViewFilterOperand.IS_IN_PAST]: CoreWorkflowFilterOperand.IS_IN_PAST,
  [ViewFilterOperand.IS_IN_FUTURE]: CoreWorkflowFilterOperand.IS_IN_FUTURE,
  [ViewFilterOperand.IS_TODAY]: CoreWorkflowFilterOperand.IS_TODAY,
  [ViewFilterOperand.IS_RELATIVE]: CoreWorkflowFilterOperand.IS_RELATIVE,
};

const toCoreWorkflowFilterRule = (
  stepFilter: StepFilter,
): CoreWorkflowFilterRuleInput | undefined => {
  const selectedField = findCoreWorkflowFilterField(stepFilter.stepOutputKey);
  const operand =
    CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND[stepFilter.operand];

  if (!isDefined(selectedField) || !isDefined(operand)) {
    return undefined;
  }

  const expectsValue = isRecordFilterOperandExpectingValue(stepFilter.operand);

  if (expectsValue && stepFilter.value === '') {
    return undefined;
  }

  return {
    fieldKey: selectedField.key,
    operand,
    value: expectsValue ? stepFilter.value : null,
  };
};

export const buildCoreWorkflowFilterInput = (
  filterSettings: FilterSettings,
): CoreWorkflowFilterInput | undefined => {
  const rules = (filterSettings.stepFilters ?? [])
    .map(toCoreWorkflowFilterRule)
    .filter(isDefined);

  if (rules.length === 0) {
    return undefined;
  }

  const [rootStepFilterGroup] = filterSettings.stepFilterGroups ?? [];

  return {
    logicalOperator:
      rootStepFilterGroup?.logicalOperator === 'OR'
        ? CoreWorkflowFilterLogicalOperator.OR
        : CoreWorkflowFilterLogicalOperator.AND,
    rules,
  };
};
