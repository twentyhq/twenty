import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { applyPositionsToFlow } from '@/workflow/utils/applyPositionsToFlow';
import { getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { UpdateCoreWorkflowVersionPositionsDocument } from '~/generated/graphql';

export const useUpdateWorkflowVersionPositions = (instanceId?: string) => {
  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow(instanceId);
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const apolloCoreClient = useApolloCoreClient();
  const [mutateCore] = useMutation(UpdateCoreWorkflowVersionPositionsDocument, {
    client: apolloCoreClient,
  });

  const store = useStore();
  const flowCallbackState = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const savePositions = async (
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
    await savePendingWorkflowFlow();

    const workflowVersionId = await getUpdatableWorkflowVersion();

    await mutateCore({
      variables: {
        input: { coreWorkflowVersionId: workflowVersionId, positions },
      },
    });

    return workflowVersionId;
  };

  const updateWorkflowVersionPositions = async (
    positions: { id: string; position: { x: number; y: number } }[],
  ) => {
    const flowBeforeUpdate = store.get(flowCallbackState);
    const positionsBeforeUpdate = getFlowPositions(flowBeforeUpdate);

    // Written before any await so the diagram switches to these positions in the same render
    setFlow((currentFlow) =>
      applyPositionsToFlow({ flow: currentFlow, positions }),
    );

    const workflowVersionId = await savePositions(positions).catch(
      (error: unknown) => {
        setFlow((currentFlow) =>
          applyPositionsToFlow({
            flow: currentFlow,
            positions: positionsBeforeUpdate,
          }),
        );

        throw error;
      },
    );

    // A draft created by the save is seeded from the server, which drops the optimistic positions
    if (workflowVersionId !== flowBeforeUpdate?.workflowVersionId) {
      setFlow((currentFlow) =>
        applyPositionsToFlow({ flow: currentFlow, positions }),
      );
    }

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { updateWorkflowVersionPositions };
};
