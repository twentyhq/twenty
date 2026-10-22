import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowFailedFlowKeysComponentState } from '@/workflow/states/workflowFailedFlowKeysComponentState';
import { workflowFlowSaveDraftVersionIdComponentState } from '@/workflow/states/workflowFlowSaveDraftVersionIdComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';
import { logError } from '~/utils/logError';

export const useSavePendingWorkflowFlow = (instanceId?: string) => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();

  const flowState = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const pendingFlowKeysState = useAtomComponentStateCallbackState(
    workflowPendingFlowKeysComponentState,
    instanceId,
  );
  const saveInProgressState = useAtomComponentStateCallbackState(
    workflowFlowSaveInProgressComponentState,
    instanceId,
  );
  const failedFlowKeysState = useAtomComponentStateCallbackState(
    workflowFailedFlowKeysComponentState,
    instanceId,
  );
  const saveDraftVersionIdState = useAtomComponentStateCallbackState(
    workflowFlowSaveDraftVersionIdComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionStep } =
    useUpdateWorkflowVersionStep(instanceId);
  const { updateWorkflowVersionTrigger } =
    useUpdateWorkflowVersionTrigger(instanceId);

  const moveFlowToWorkflowVersionOrThrow = useCallback(
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
        throw new Error(
          doNotTranslate(`Workflow version ${workflowVersionId} not found`),
        );
      }

      store.set(flowState, (localFlow) =>
        buildFlowWithLocalEdits({
          serverFlow: {
            workflowVersionId,
            trigger: workflowVersion.trigger,
            steps: workflowVersion.steps,
          },
          localFlow,
          localFlowKeys: [...flowKeys, ...store.get(pendingFlowKeysState)],
        }),
      );
    },
    [apolloCoreClient, flowState, store, pendingFlowKeysState],
  );

  const saveFlowKeys = useCallback(
    async (flowKeys: string[]): Promise<string[]> => {
      const workflowVersionId = await getUpdatableWorkflowVersion();

      if (store.get(flowState)?.workflowVersionId !== workflowVersionId) {
        await moveFlowToWorkflowVersionOrThrow({ workflowVersionId, flowKeys });
      }

      const failedFlowKeys: string[] = [];

      for (const flowKey of flowKeys) {
        const flow = store.get(flowState);

        if (flowKey === TRIGGER_STEP_ID) {
          if (
            isDefined(flow?.trigger) &&
            !(await updateWorkflowVersionTrigger({
              workflowVersionId,
              trigger: flow.trigger,
            }))
          ) {
            failedFlowKeys.push(flowKey);
          }

          continue;
        }

        const step = flow?.steps?.find((flowStep) => flowStep.id === flowKey);

        if (
          isDefined(step) &&
          !isDefined(
            await updateWorkflowVersionStep({ workflowVersionId, step }),
          )
        ) {
          failedFlowKeys.push(flowKey);
        }
      }

      return failedFlowKeys;
    },
    [
      flowState,
      getUpdatableWorkflowVersion,
      moveFlowToWorkflowVersionOrThrow,
      store,
      updateWorkflowVersionStep,
      updateWorkflowVersionTrigger,
    ],
  );

  const saveFlow = useCallback(
    async ({
      shouldRetryFailedFlowKeys,
    }: {
      shouldRetryFailedFlowKeys: boolean;
    }): Promise<boolean> => {
      let saveInProgress = store.get(saveInProgressState);

      while (isDefined(saveInProgress)) {
        await saveInProgress.promise.catch(() => undefined);
        saveInProgress = store.get(saveInProgressState);
      }

      const pendingFlowKeys = store.get(pendingFlowKeysState);
      const previouslyFailedFlowKeys = store
        .get(failedFlowKeysState)
        .filter((flowKey) => !pendingFlowKeys.includes(flowKey));

      // Failed keys ride along with new edits so waiters on a failed save do not each retry it
      if (
        pendingFlowKeys.length === 0 &&
        (!shouldRetryFailedFlowKeys || previouslyFailedFlowKeys.length === 0)
      ) {
        return previouslyFailedFlowKeys.length === 0;
      }

      const flowKeys = [...previouslyFailedFlowKeys, ...pendingFlowKeys];

      store.set(pendingFlowKeysState, []);
      store.set(failedFlowKeysState, []);

      const failedFlowKeysPromise = saveFlowKeys(flowKeys).catch(
        (error: unknown) => {
          logError(error);

          return flowKeys;
        },
      );

      store.set(saveInProgressState, {
        flowKeys,
        promise: failedFlowKeysPromise.then(() => undefined),
      });

      const failedFlowKeys = await failedFlowKeysPromise;

      store.set(failedFlowKeysState, (currentFailedFlowKeys) => [
        ...currentFailedFlowKeys.filter(
          (flowKey) => !failedFlowKeys.includes(flowKey),
        ),
        ...failedFlowKeys,
      ]);
      store.set(saveInProgressState, undefined);

      return failedFlowKeys.length === 0;
    },
    [
      failedFlowKeysState,
      saveFlowKeys,
      saveInProgressState,
      store,
      pendingFlowKeysState,
    ],
  );

  const saveWorkflowFlowEdits = useCallback(
    () => saveFlow({ shouldRetryFailedFlowKeys: false }),
    [saveFlow],
  );

  const savePendingWorkflowFlow = useCallback(async () => {
    const isSaved = await saveFlow({ shouldRetryFailedFlowKeys: true });
    const flow = store.get(flowState);

    return {
      isSaved,
      savedDraftFlow:
        isDefined(flow) &&
        flow.workflowVersionId === store.get(saveDraftVersionIdState)
          ? flow
          : undefined,
    };
  }, [flowState, saveDraftVersionIdState, saveFlow, store]);

  return { savePendingWorkflowFlow, saveWorkflowFlowEdits };
};
