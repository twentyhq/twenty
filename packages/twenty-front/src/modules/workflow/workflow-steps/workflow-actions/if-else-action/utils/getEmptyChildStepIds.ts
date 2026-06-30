import {
  type WorkflowIfElseAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const getEmptyChildStepIds = ({
  ifElseAction,
  allSteps,
}: {
  ifElseAction: WorkflowIfElseAction;
  allSteps: WorkflowStep[];
}): string[] => {
  const branches = ifElseAction.settings.input.branches;
  const childStepIds = branches.flatMap((branch) => branch.nextStepIds);

  return childStepIds.filter((childStepId) => {
    const childStep = allSteps.find((step) => step.id === childStepId);
    return isDefined(childStep) && childStep.type === 'EMPTY';
  });
};
