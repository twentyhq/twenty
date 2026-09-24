import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';
import { v4 } from 'uuid';

export const buildEmptyStepFilter = ({
  stepFilterGroupId,
  positionInStepFilterGroup,
}: {
  stepFilterGroupId: string;
  positionInStepFilterGroup: number;
}): StepFilter => ({
  id: v4(),
  type: 'unknown',
  value: '',
  operand: ViewFilterOperand.IS,
  stepOutputKey: '',
  stepFilterGroupId,
  positionInStepFilterGroup,
});
