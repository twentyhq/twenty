import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { assertWorkflowConnectionOrThrow } from '@/workflow/workflow-diagram/utils/assertWorkflowConnectionOrThrow';
import { getReconnectedStepIds } from '@/workflow/workflow-diagram/utils/getReconnectedStepIds';
import { reconnectWorkflowStep } from '@/workflow/workflow-diagram/utils/reconnectWorkflowStep';
import { wouldReconnectWorkflowEdgeCreateCycle } from '@/workflow/workflow-diagram/utils/wouldReconnectWorkflowEdgeCreateCycle';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { type Connection } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useRef } from 'react';

type ReconnectionState = {
  queue: Promise<void>;
  pendingSources: Map<string, WorkflowStep>;
  pendingTrigger: WorkflowTrigger | undefined;
  pendingCount: number;
};

export const useReconnectWorkflowEdge = () => {
  const flow = useAtomComponentStateValue(flowComponentState);
  const { updateStep } = useUpdateStep();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();
  // Events from the same render must share an imperative queue and pending writes.
  // oxlint-disable-next-line twenty/no-state-useref
  const reconnectionStateRef = useRef<ReconnectionState>({
    queue: Promise.resolve(),
    pendingSources: new Map(),
    pendingTrigger: undefined,
    pendingCount: 0,
  });

  const reconnectEdgeImmediately = async (
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

    const flowWithPendingSources = {
      ...flow,
      trigger: reconnectionStateRef.current.pendingTrigger ?? flow.trigger,
      steps: flow.steps.map(
        (step) =>
          reconnectionStateRef.current.pendingSources.get(step.id) ?? step,
      ),
    };

    if (
      wouldReconnectWorkflowEdgeCreateCycle({
        flow: flowWithPendingSources,
        sourceStepId: oldEdge.source,
        targetStepId: connection.target,
      })
    ) {
      return;
    }

    if (oldEdge.source === TRIGGER_STEP_ID) {
      const trigger =
        reconnectionStateRef.current.pendingTrigger ?? flow.trigger;
      const nextStepIds = getReconnectedStepIds({
        nextStepIds: trigger?.nextStepIds,
        oldTargetId: oldEdge.target,
        newTargetId: connection.target,
      });

      if (isDefined(trigger) && isDefined(nextStepIds)) {
        const updatedTrigger = { ...trigger, nextStepIds };

        await updateTrigger(updatedTrigger);
        reconnectionStateRef.current.pendingTrigger = updatedTrigger;
      }

      return;
    }

    const sourceStep =
      reconnectionStateRef.current.pendingSources.get(oldEdge.source) ??
      flowWithPendingSources.steps.find((step) => step.id === oldEdge.source);

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
      reconnectionStateRef.current.pendingSources.set(
        oldEdge.source,
        updatedStep,
      );
    }
  };

  const reconnectEdge = (
    oldEdge: WorkflowDiagramEdge,
    connection: Connection,
  ) => {
    reconnectionStateRef.current.pendingCount += 1;

    const reconnection = reconnectionStateRef.current.queue.then(() =>
      reconnectEdgeImmediately(oldEdge, connection),
    );

    reconnectionStateRef.current.queue = reconnection
      .catch(() => undefined)
      .finally(() => {
        reconnectionStateRef.current.pendingCount -= 1;

        if (reconnectionStateRef.current.pendingCount === 0) {
          reconnectionStateRef.current.pendingSources.clear();
          reconnectionStateRef.current.pendingTrigger = undefined;
        }
      });

    return reconnection;
  };

  return { reconnectEdge };
};
