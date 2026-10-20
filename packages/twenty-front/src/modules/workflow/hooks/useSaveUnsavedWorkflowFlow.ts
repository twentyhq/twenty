import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowFlowSaveDraftVersionIdComponentState } from '@/workflow/states/workflowFlowSaveDraftVersionIdComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useSaveUnsavedWorkflowFlow = (instanceId?: string) => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();

  const flowAtom = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const unsavedFlowKeysAtom = useAtomComponentStateCallbackState(
    workflowUnsavedFlowKeysComponentState,
    instanceId,
  );
  const saveInProgressAtom = useAtomComponentStateCallbackState(
    workflowFlowSaveInProgressComponentState,
    instanceId,
  );
  const saveDraftVersionIdAtom = useAtomComponentStateCallbackState(
    workflowFlowSaveDraftVersionIdComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionStep } =
    useUpdateWorkflowVersionStep(instanceId);
  const { updateWorkflowVersionTrigger } =
    useUpdateWorkflowVersionTrigger(instanceId);

  const moveFlowToWorkflowVersion = useCallback(
    async ({
      workflowVersionId,
      flowKeys,
    }: {
      workflowVersionId: string;
      flowKeys: string[];
    }) => {
      const { data } = await apolloCoreClient.query({
        query: GetCoreWorkflowVersionDocument,
        variables: { coreWorkflowVersionId: workflowVersionId },
        fetchPolicy: 'network-only',
      });

      const workflowVersion = data?.coreWorkflowVersion;

      if (!isDefined(workflowVersion)) {
        return;
      }

      store.set(flowAtom, (localFlow) =>
        buildFlowWithLocalEdits({
          serverFlow: {
            workflowVersionId,
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          },
          localFlow,
          localFlowKeys: [...flowKeys, ...store.get(unsavedFlowKeysAtom)],
        }),
      );
    },
    [apolloCoreClient, flowAtom, store, unsavedFlowKeysAtom],
  );

  const saveFlowKeys = useCallback(
    async (flowKeys: string[]) => {
      const flowVersionId = store.get(flowAtom)?.workflowVersionId;
      const saveDraftVersionId = store.get(saveDraftVersionIdAtom);

      // A save can run on a stale render that has not seen the draft created by an earlier save
      const workflowVersionId =
        isDefined(saveDraftVersionId) && saveDraftVersionId === flowVersionId
          ? saveDraftVersionId
          : await getUpdatableWorkflowVersion();

      store.set(saveDraftVersionIdAtom, workflowVersionId);

      if (flowVersionId !== workflowVersionId) {
        await moveFlowToWorkflowVersion({ workflowVersionId, flowKeys });
      }

      for (const flowKey of flowKeys) {
        const flow = store.get(flowAtom);

        if (flowKey === TRIGGER_STEP_ID) {
          if (isDefined(flow?.trigger)) {
            await updateWorkflowVersionTrigger({
              workflowVersionId,
              trigger: flow.trigger,
            });
          }

          continue;
        }

        const step = flow?.steps?.find((flowStep) => flowStep.id === flowKey);

        if (isDefined(step)) {
          await updateWorkflowVersionStep({ workflowVersionId, step });
        }
      }
    },
    [
      flowAtom,
      getUpdatableWorkflowVersion,
      moveFlowToWorkflowVersion,
      saveDraftVersionIdAtom,
      store,
      updateWorkflowVersionStep,
      updateWorkflowVersionTrigger,
    ],
  );

  const saveUnsavedWorkflowFlow = useCallback(async () => {
    let saveInProgress = store.get(saveInProgressAtom);

    while (isDefined(saveInProgress)) {
      await saveInProgress.promise.catch(() => undefined);
      saveInProgress = store.get(saveInProgressAtom);
    }

    const flowKeys = store.get(unsavedFlowKeysAtom);

    if (flowKeys.length === 0) {
      return;
    }

    store.set(unsavedFlowKeysAtom, []);

    const promise = saveFlowKeys(flowKeys);

    store.set(saveInProgressAtom, { flowKeys, promise });

    try {
      await promise;
    } catch {
      store.set(unsavedFlowKeysAtom, (unsavedFlowKeys) => [
        ...flowKeys.filter((flowKey) => !unsavedFlowKeys.includes(flowKey)),
        ...unsavedFlowKeys,
      ]);
    } finally {
      store.set(saveInProgressAtom, undefined);
    }
  }, [saveFlowKeys, saveInProgressAtom, store, unsavedFlowKeysAtom]);

  return { saveUnsavedWorkflowFlow };
};
