import {
  StepLogicalOperator,
  ViewFilterOperand,
  type StepFilter,
  type StepFilterGroup,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const createElseIfBranch = (): {
  filterGroup: StepFilterGroup;
  filter: StepFilter;
  branchId: string;
  filterGroupId: string;
} => {
  const newFilterGroupId = v4();
  const newFilterId = v4();
  const newBranchId = v4();

  return {
    filterGroup: {
      id: newFilterGroupId,
      logicalOperator: StepLogicalOperator.AND,
      positionInStepFilterGroup: 0,
    },
    filter: {
      id: newFilterId,
      type: 'unknown',
      stepOutputKey: '',
      operand: ViewFilterOperand.IS,
      value: '',
      stepFilterGroupId: newFilterGroupId,
      positionInStepFilterGroup: 0,
    },
    branchId: newBranchId,
    filterGroupId: newFilterGroupId,
  };
};
