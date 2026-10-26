import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { keepServerStepResourceIds } from '@/workflow/utils/keepServerStepResourceIds';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

type Flow = {
  workflowVersionId: string;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

export const buildFlowWithLocalEdits = ({
  serverFlow,
  localFlow,
  localFlowKeys,
}: {
  serverFlow: Flow;
  localFlow: Pick<Flow, 'trigger' | 'steps'> | undefined;
  localFlowKeys: string[];
}): Flow => {
  if (!isDefined(localFlow) || localFlowKeys.length === 0) {
    return serverFlow;
  }

  const trigger =
    localFlowKeys.includes(TRIGGER_STEP_ID) && isDefined(localFlow.trigger)
      ? localFlow.trigger
      : serverFlow.trigger;

  const steps =
    serverFlow.steps?.map((serverStep) => {
      if (!localFlowKeys.includes(serverStep.id)) {
        return serverStep;
      }

      const localStep = localFlow.steps?.find(
        (candidateStep) => candidateStep.id === serverStep.id,
      );

      return isDefined(localStep)
        ? keepServerStepResourceIds({ localStep, serverStep })
        : serverStep;
    }) ?? null;

  return { workflowVersionId: serverFlow.workflowVersionId, trigger, steps };
};
