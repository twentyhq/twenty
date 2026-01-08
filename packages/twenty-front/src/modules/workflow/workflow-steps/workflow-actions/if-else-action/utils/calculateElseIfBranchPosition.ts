import { IF_ELSE_BRANCH_POSITION_OFFSETS } from 'twenty-shared/workflow';

const BRANCH_HORIZONTAL_SPACING = 200;

export const calculateElseIfBranchPosition = (
  branchIndex: number,
  totalBranches: number,
  ifElseStepPosition: { x: number; y: number },
): { x: number; y: number } => {
  const isIfBranch = branchIndex === 0;
  const isElseBranch = branchIndex === totalBranches - 1;

  const totalWidth = (totalBranches - 1) * BRANCH_HORIZONTAL_SPACING;

  let positionX: number;

  if (isIfBranch) {
    positionX = -totalWidth / 2;
  } else if (isElseBranch) {
    positionX = totalWidth / 2;
  } else {
    const spacing = totalWidth / (totalBranches - 1);
    positionX = -totalWidth / 2 + branchIndex * spacing;
  }

  return {
    x: ifElseStepPosition.x + positionX,
    y: ifElseStepPosition.y + IF_ELSE_BRANCH_POSITION_OFFSETS.IF.y,
  };
};
