import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { assertWorkflowConnectionOrThrow } from '@/workflow/workflow-diagram/utils/assertWorkflowConnectionOrThrow';
import { getReconnectedStepIds } from '@/workflow/workflow-diagram/utils/getReconnectedStepIds';
import { reconnectWorkflowStep } from '@/workflow/workflow-diagram/utils/reconnectWorkflowStep';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { type Connection } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useReconnectWorkflowEdge = () => {
  const flow = useAtomComponentStateValue(flowComponentState);
  const { updateStep } = useUpdateStep();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const reconnectEdge = async (
    oldEdge: WorkflowDiagramEdge,
    connection: Connection,
  ) => {
    assertWorkflowConnectionOrThrow(connection);

    if (
      oldEdge.source !== connection.source ||
      oldEdge.sourceHandle !== connection.sourceHandle ||
      !flow?.steps?.some((step) => step.id === connection.target)
    ) {
      return;
    }

    if (oldEdge.source === TRIGGER_STEP_ID) {
      const trigger = flow.trigger;
      const nextStepIds = getReconnectedStepIds({
        nextStepIds: trigger?.nextStepIds,
        oldTargetId: oldEdge.target,
        newTargetId: connection.target,
      });

      if (isDefined(trigger) && isDefined(nextStepIds)) {
        await updateTrigger({ ...trigger, nextStepIds });
      }

      return;
    }

    const sourceStep = flow.steps.find((step) => step.id === oldEdge.source);

    if (!isDefined(sourceStep)) {
      return;
    }

    const updatedStep = reconnectWorkflowStep({
      step: sourceStep,
      oldTargetId: oldEdge.target,
      newTargetId: connection.target,
      connectionOptions:
        oldEdge.data?.sourceConnectionOptions ??
        getConnectionOptionsForSourceHandle({
          sourceHandleId: oldEdge.sourceHandle,
        }),
    });

    if (isDefined(updatedStep)) {
      await updateStep(updatedStep);
    }
  };

  return { reconnectEdge };
};
