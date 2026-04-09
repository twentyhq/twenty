import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { createElseIfBranch } from './createElseIfBranch';

export const prepareIfElseStepWithNewBranch = ({
  parentStep,
  targetStepId,
}: {
  parentStep: WorkflowIfElseAction;
  targetStepId: string;
}): WorkflowIfElseAction => {
  const branches = parentStep.settings.input.branches;
  const stepFilterGroups = parentStep.settings.input.stepFilterGroups;
  const stepFilters = parentStep.settings.input.stepFilters;

  const { filterGroup, filter, branchId, filterGroupId } = createElseIfBranch();

  const updatedBranches = [...branches];
  updatedBranches.splice(branches.length - 1, 0, {
    id: branchId,
    filterGroupId,
    nextStepIds: [targetStepId],
  });

  return {
    ...parentStep,
    settings: {
      ...parentStep.settings,
      input: {
        ...parentStep.settings.input,
        stepFilterGroups: [...stepFilterGroups, filterGroup],
        stepFilters: [...stepFilters, filter],
        branches: updatedBranches,
      },
    },
  };
};
