import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { UpdateCoreWorkflowVersionPositionsDocument } from '~/generated/graphql';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { applyPositionsToFlow } from '@/workflow/utils/applyPositionsToFlow';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';

export const useTidyUpWorkflowVersion = (instanceId?: string) => {
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow(instanceId);
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(UpdateCoreWorkflowVersionPositionsDocument, {
    client: apolloCoreClient,
  });

  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const updateWorkflowVersionPositions = async (
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
    // Written before any await so the diagram switches to these positions in the same render
    setFlow((currentFlow) =>
      applyPositionsToFlow({ flow: currentFlow, positions }),
    );

    await savePendingWorkflowFlow();

    const workflowVersionId = await getUpdatableWorkflowVersion();

    await mutateCore({
      variables: {
        input: { coreWorkflowVersionId: workflowVersionId, positions },
      },
    });

    setFlow((currentFlow) =>
      isDefined(currentFlow)
        ? applyPositionsToFlow({
            flow: { ...currentFlow, workflowVersionId },
            positions,
          })
        : currentFlow,
    );

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  const tidyUpWorkflowVersion = async (workflowDiagram: WorkflowDiagram) => {
    const tidiedUpDiagram = getOrganizedDiagram(workflowDiagram);

    await updateWorkflowVersionPositions(
      tidiedUpDiagram.nodes.map((node) => ({
        id: node.id,
        position: node.position,
      })),
    );

    return tidiedUpDiagram;
  };

  return { tidyUpWorkflowVersion, updateWorkflowVersionPositions };
};
