import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { UpdateCoreWorkflowVersionPositionsDocument } from '~/generated/graphql';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';

export const useTidyUpWorkflowVersion = (instanceId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(UpdateCoreWorkflowVersionPositionsDocument, {
    client: apolloCoreClient,
  });

  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const updateWorkflowVersionPosition = async (
    workflowVersionId: string,
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
    await mutateCore({
      variables: {
        input: { coreWorkflowVersionId: workflowVersionId, positions },
      },
    });

    setFlow((currentFlow) => {
      if (!isDefined(currentFlow)) {
        return currentFlow;
      }

      const triggerPositionInFlow = positions.find(
        (position) => position.id === 'trigger',
      );

      return {
        ...currentFlow,
        workflowVersionId,
        trigger:
          isDefined(triggerPositionInFlow) && isDefined(currentFlow.trigger)
            ? {
                ...currentFlow.trigger,
                position: triggerPositionInFlow.position,
              }
            : currentFlow.trigger,
        steps:
          currentFlow.steps?.map((step) => {
            const stepPosition = positions.find(
              (position) => position.id === step.id,
            );

            return isDefined(stepPosition)
              ? { ...step, position: stepPosition.position }
              : step;
          }) ?? null,
      };
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  const tidyUpWorkflowVersion = async (
    workflowVersionId: string,
    workflowDiagram: WorkflowDiagram,
  ) => {
    if (!isDefined(workflowDiagram)) {
      return;
    }

    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    const positions = tidiedUpDiagram.nodes.map((node) => ({
      id: node.id,
      position: node.position,
    }));

    await updateWorkflowVersionPosition(workflowVersionId, positions);

    return tidiedUpDiagram;
  };

  return { tidyUpWorkflowVersion, updateWorkflowVersionPosition };
};
