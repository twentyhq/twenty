import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { assertWorkflowConnectionOrThrow } from '@/workflow/workflow-diagram/utils/assertWorkflowConnectionOrThrow';
import { wouldReconnectWorkflowEdgeCreateCycle } from '@/workflow/workflow-diagram/utils/wouldReconnectWorkflowEdgeCreateCycle';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { getReconnectedStepIds } from '@/workflow/workflow-steps/utils/getReconnectedStepIds';
import { reconnectWorkflowStep } from '@/workflow/workflow-steps/utils/reconnectWorkflowStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { type Connection } from '@xyflow/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useReconnectWorkflowEdge = () => {
  const store = useStore();
  const flowCallbackState =
    useAtomComponentStateCallbackState(flowComponentState);
  const { updateStep } = useUpdateStep();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const reconnectEdge = async (
    oldEdge: WorkflowDiagramEdge,
    connection: Connection,
  ) => {
    assertWorkflowConnectionOrThrow(connection);
    const flow = store.get(flowCallbackState);

    if (
      !isDefined(flow) ||
      !isDefined(flow.steps) ||
      oldEdge.source !== connection.source ||
      oldEdge.sourceHandle !== connection.sourceHandle ||
      !flow.steps.some((step) => step.id === connection.target)
    ) {
      return false;
    }

    if (
      wouldReconnectWorkflowEdgeCreateCycle({
        flow,
        sourceStepId: oldEdge.source,
        targetStepId: connection.target,
      })
    ) {
      return false;
    }

    if (oldEdge.source === TRIGGER_STEP_ID) {
      const trigger = flow.trigger;
      const nextStepIds = getReconnectedStepIds({
        nextStepIds: trigger?.nextStepIds,
        oldTargetId: oldEdge.target,
        newTargetId: connection.target,
      });

      if (isDefined(trigger) && isDefined(nextStepIds)) {
        const updatedTrigger = { ...trigger, nextStepIds };

        await updateTrigger(updatedTrigger);

        return isDeeplyEqual(
          store.get(flowCallbackState)?.trigger?.nextStepIds,
          nextStepIds,
        );
      }

      return false;
    }

    const sourceStep = flow.steps.find((step) => step.id === oldEdge.source);

    if (!isDefined(sourceStep)) {
      return false;
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
      const { updatedStep: savedStep } = await updateStep(updatedStep);

      return isDefined(savedStep);
    }

    return false;
  };

  return { reconnectEdge };
};
