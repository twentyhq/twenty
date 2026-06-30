import { isDefined } from 'twenty-shared/utils';
import { type StepIfElseBranch } from 'twenty-shared/workflow';
import { calculateElseIfBranchPosition } from './calculateElseIfBranchPosition';

export const calculateExistingBranchPositions = ({
  branches,
  elseIfBranchIndex,
  totalBranches,
  ifElseStepPosition,
}: {
  branches: StepIfElseBranch[];
  elseIfBranchIndex: number;
  totalBranches: number;
  ifElseStepPosition: { x: number; y: number };
}): Array<{ id: string; position: { x: number; y: number } }> => {
  return branches.reduce<
    Array<{ id: string; position: { x: number; y: number } }>
  >((acc, branch, branchIndex) => {
    const firstChildStepId = branch.nextStepIds[0];

    if (!isDefined(firstChildStepId)) {
      return acc;
    }

    const adjustedBranchIndex =
      branchIndex < elseIfBranchIndex ? branchIndex : branchIndex + 1;

    const branchNodePosition = calculateElseIfBranchPosition(
      adjustedBranchIndex,
      totalBranches,
      ifElseStepPosition,
    );

    acc.push({
      id: firstChildStepId,
      position: branchNodePosition,
    });

    return acc;
  }, []);
};
