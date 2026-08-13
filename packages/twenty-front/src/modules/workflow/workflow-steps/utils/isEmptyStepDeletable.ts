import { type WorkflowAction } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

// The "if" and "else" branches of an If/Else step always keep at least one child:
// deleting their last child would only make the server recreate an empty step.
export const isEmptyStepDeletable = ({
  stepId,
  steps,
}: {
  stepId: string;
  steps: WorkflowAction[] | null;
}): boolean => {
  return (steps ?? []).every((step) => {
    if (step.type !== 'IF_ELSE') {
      return true;
    }

    const branches = step.settings.input.branches;

    return branches.every((branch, branchIndex) => {
      if (!branch.nextStepIds.includes(stepId)) {
        return true;
      }

      const isIfBranch = branchIndex === 0;
      const isElseBranch =
        branchIndex === branches.length - 1 && !isDefined(branch.filterGroupId);

      return !(isIfBranch || isElseBranch) || branch.nextStepIds.length > 1;
    });
  });
};
