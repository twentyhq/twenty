import { IF_ELSE_BRANCH_POSITION_OFFSETS } from 'twenty-shared/workflow';

export const calculateElseIfBranchPosition = (
  branchIndex: number,
  ifElseStepPosition: { x: number; y: number },
): { x: number; y: number } => {
  const totalElseIfBranches = branchIndex;
  const positionX =
    totalElseIfBranches > 0
      ? IF_ELSE_BRANCH_POSITION_OFFSETS.IF.x +
        ((IF_ELSE_BRANCH_POSITION_OFFSETS.ELSE.x -
          IF_ELSE_BRANCH_POSITION_OFFSETS.IF.x) *
          branchIndex) /
          (totalElseIfBranches + 1)
      : IF_ELSE_BRANCH_POSITION_OFFSETS.IF.x;

  return {
    x: ifElseStepPosition.x + positionX,
    y: ifElseStepPosition.y + IF_ELSE_BRANCH_POSITION_OFFSETS.IF.y,
  };
};
