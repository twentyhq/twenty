import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { applyPositionsToFlow } from '@/workflow/utils/applyPositionsToFlow';
import { getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { UpdateCoreWorkflowVersionPositionsDocument } from '~/generated/graphql';

type NodePositionUpdate = { id: string; position: { x: number; y: number } };

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
  const saveInProgressCallbackState = useAtomComponentStateCallbackState(
    workflowFlowSaveInProgressComponentState,
    instanceId,
  );
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const savePositions = async (positions: NodePositionUpdate[]) => {
    await savePendingWorkflowFlow();

    const saving = getUpdatableWorkflowVersion().then((workflowVersionId) =>
      mutateCore({
        variables: {
          input: { coreWorkflowVersionId: workflowVersionId, positions },
        },
      }),
    );

    // Reseeds from the server keep the local nodes of a save in progress, so a draft created meanwhile keeps the positions
    store.set(saveInProgressCallbackState, {
      flowKeys: positions.map(({ id }) => id),
      promise: saving.then(() => undefined),
    });

    try {
      await saving;
    } finally {
      store.set(saveInProgressCallbackState, undefined);
    }
  };

  const updateWorkflowVersionPositions = async (
    positions: NodePositionUpdate[],
  ) => {
    const positionsBeforeUpdate = getFlowPositions(
      store.get(flowCallbackState),
    );

    // Written before any await so the diagram switches to these positions in the same render
    setFlow((currentFlow) =>
      applyPositionsToFlow({ flow: currentFlow, positions }),
    );

    await savePositions(positions).catch((error: unknown) => {
      setFlow((currentFlow) =>
        applyPositionsToFlow({
          flow: currentFlow,
          positions: positionsBeforeUpdate,
        }),
      );

      throw error;
    });

    await invalidateCoreWorkflowVersions(apolloCoreClient);
  };

  return { updateWorkflowVersionPositions };
};
