import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilterGroup,
} from 'twenty-shared/types';

import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const buildNonSystemCoreObjectFilterSettings = (
  isSystemFieldKey: string,
): FilterSettings => {
  // Stable ids keep a persisted default deeply equal to a freshly built one
  const rootStepFilterGroup: StepFilterGroup = {
    id: `${isSystemFieldKey}-default-group`,
    logicalOperator: StepLogicalOperator.AND,
  };

  return {
    stepFilterGroups: [rootStepFilterGroup],
    stepFilters: [
      {
        id: `${isSystemFieldKey}-default-rule`,
        type: 'BOOLEAN',
        stepOutputKey: isSystemFieldKey,
        operand: ViewFilterOperand.IS,
        value: 'false',
        stepFilterGroupId: rootStepFilterGroup.id,
        positionInStepFilterGroup: 0,
      },
    ],
  };
};
