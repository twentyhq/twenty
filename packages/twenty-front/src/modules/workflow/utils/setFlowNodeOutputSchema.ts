import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

type Flow = {
  workflowVersionId: string;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

export const setFlowNodeOutputSchema = ({
  flow,
  flowKey,
  outputSchema,
}: {
  flow: Flow;
  flowKey: string;
  outputSchema: WorkflowAction['settings']['outputSchema'];
}): Flow => {
  if (flowKey === TRIGGER_STEP_ID) {
    if (!isDefined(flow.trigger)) {
      return flow;
    }

    const trigger = { ...flow.trigger };

    trigger.settings = { ...trigger.settings, outputSchema };

    return { ...flow, trigger };
  }

  return {
    ...flow,
    steps:
      flow.steps?.map((flowStep) => {
        if (flowStep.id !== flowKey) {
          return flowStep;
        }

        const step = { ...flowStep };

        step.settings = { ...step.settings, outputSchema };

        return step;
      }) ?? null,
  };
};
