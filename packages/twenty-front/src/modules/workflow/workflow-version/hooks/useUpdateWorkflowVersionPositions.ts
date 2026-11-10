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
import { isDefined } from 'twenty-shared/utils';
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
    const positionsBeforeUpdate = getFlowPositions(
      store.get(flowCallbackState),
    );

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

    setFlow((currentFlow) =>
      isDefined(currentFlow)
        ? { ...currentFlow, workflowVersionId }
        : currentFlow,
    );

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { updateWorkflowVersionPositions };
};
