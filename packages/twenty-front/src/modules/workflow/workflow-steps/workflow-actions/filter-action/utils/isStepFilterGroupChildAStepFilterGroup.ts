import {
  StepFilter,
  StepFilterGroup,
} from 'twenty-shared/src/types/StepFilters';

export const isStepFilterGroupChildAStepFilterGroup = (
  child: StepFilter | StepFilterGroup,
): child is StepFilterGroup => {
  return ('logicalOperator' satisfies keyof StepFilterGroup) in child;
};
