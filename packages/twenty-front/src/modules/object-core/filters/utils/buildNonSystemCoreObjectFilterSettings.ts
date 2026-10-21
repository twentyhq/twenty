import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilterGroup,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const buildNonSystemCoreObjectFilterSettings = (
  isSystemFieldKey: string,
): FilterSettings => {
  const rootStepFilterGroup: StepFilterGroup = {
    id: v4(),
    logicalOperator: StepLogicalOperator.AND,
  };

  return {
    stepFilterGroups: [rootStepFilterGroup],
    stepFilters: [
      {
        id: v4(),
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
