import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

type Flow = {
  workflowVersionId: string;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

export const replaceStepInFlow = ({
  flow,
  step,
}: {
  flow: Flow | undefined;
  step: WorkflowAction;
}): Flow | undefined => {
  if (!isDefined(flow)) {
    return flow;
  }

  return {
    ...flow,
    steps: (flow.steps ?? []).map((flowStep) =>
      flowStep.id === step.id ? step : flowStep,
    ),
  };
};
