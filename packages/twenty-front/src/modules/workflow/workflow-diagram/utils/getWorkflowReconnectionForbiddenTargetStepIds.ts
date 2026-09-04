import { type WorkflowAction } from '@/workflow/types/Workflow';
import { getPreviousSteps } from '@/workflow/workflow-steps/utils/getWorkflowPreviousSteps';
import { isDefined } from 'twenty-shared/utils';

export type WorkflowFlow = {
  steps: WorkflowAction[] | null;
};

export const getWorkflowReconnectionForbiddenTargetStepIds = ({
  flow,
  sourceStepId,
}: {
  flow: WorkflowFlow;
  sourceStepId: string;
}): Set<string> => {
  const steps = flow.steps ?? [];
  const sourceStep = steps.find((step) => step.id === sourceStepId);

  if (!isDefined(sourceStep)) {
    return new Set<string>();
  }

  return new Set(
    getPreviousSteps({ steps, currentStep: sourceStep }).map((step) => step.id),
  );
};
