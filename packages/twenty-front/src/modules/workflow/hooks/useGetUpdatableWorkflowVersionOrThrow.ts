import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowDraftVersionCreationComponentState } from '@/workflow/states/workflowDraftVersionCreationComponentState';
import { workflowFailedFlowKeysComponentState } from '@/workflow/states/workflowFailedFlowKeysComponentState';
import { workflowFlowSaveDraftVersionIdComponentState } from '@/workflow/states/workflowFlowSaveDraftVersionIdComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useGetUpdatableWorkflowVersionOrThrow = (instanceId?: string) => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
    instanceId,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const flowState = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const saveDraftVersionIdState = useAtomComponentStateCallbackState(
    workflowFlowSaveDraftVersionIdComponentState,
    instanceId,
  );
  const draftVersionCreationState = useAtomComponentStateCallbackState(
    workflowDraftVersionCreationComponentState,
    instanceId,
  );
  const pendingFlowKeysState = useAtomComponentStateCallbackState(
    workflowPendingFlowKeysComponentState,
    instanceId,
  );
  const failedFlowKeysState = useAtomComponentStateCallbackState(
    workflowFailedFlowKeysComponentState,
    instanceId,
  );
  const saveInProgressState = useAtomComponentStateCallbackState(
    workflowFlowSaveInProgressComponentState,
    instanceId,
  );

  const moveFlowToWorkflowVersionOrThrow = async (
    workflowVersionId: string,
  ) => {
    const flow = store.get(flowState);

    if (!isDefined(flow) || flow.workflowVersionId === workflowVersionId) {
      return;
    }

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
        localFlowKeys: [
          ...store.get(pendingFlowKeysState),
          ...store.get(failedFlowKeysState),
          ...(store.get(saveInProgressState)?.flowKeys ?? []),
        ],
      }),
    );
  };

  const resolveUpdatableWorkflowVersionId = async (): Promise<string> => {
    const saveDraftVersionId = store.get(saveDraftVersionIdState);

    // The caller may run on a stale render that has not seen a draft created by an earlier save
    if (
      isDefined(saveDraftVersionId) &&
      saveDraftVersionId === store.get(flowState)?.workflowVersionId
    ) {
      return saveDraftVersionId;
    }

    if (!isDefined(workflowVisualizerWorkflowId) || !isDefined(workflow)) {
      throw new Error(
        doNotTranslate('Failed to get updatable workflow version'),
      );
    }

    if (workflow.currentVersion.status === 'DRAFT') {
      store.set(saveDraftVersionIdState, workflow.currentVersion.id);

      return workflow.currentVersion.id;
    }

    // A second draft creation would overwrite the first draft with the copied version
    const draftVersionCreation =
      store.get(draftVersionCreationState) ??
      createDraftFromWorkflowVersion({
        workflowId: workflowVisualizerWorkflowId,
        workflowVersionIdToCopy: workflow.currentVersion.id,
      })
        .then(async (draftVersionId) => {
          if (isDefined(draftVersionId)) {
            await moveFlowToWorkflowVersionOrThrow(draftVersionId);
          }

          return draftVersionId;
        })
        .finally(() => store.set(draftVersionCreationState, undefined));

    store.set(draftVersionCreationState, draftVersionCreation);

    const draftVersionId = await draftVersionCreation;

    if (!isDefined(draftVersionId)) {
      throw new Error(doNotTranslate('Failed to create draft version'));
    }

    store.set(saveDraftVersionIdState, draftVersionId);

    return draftVersionId;
  };

  const getUpdatableWorkflowVersion = async (): Promise<string> => {
    const workflowVersionId = await resolveUpdatableWorkflowVersionId();

    await moveFlowToWorkflowVersionOrThrow(workflowVersionId);

    return workflowVersionId;
  };

  const getUpdatableWorkflowVersionStepOrThrow = async <
    TStepType extends WorkflowAction['type'],
  >({
    stepId,
    stepType,
  }: {
    stepId: string;
    stepType: TStepType;
  }): Promise<Extract<WorkflowAction, { type: TStepType }>> => {
    await getUpdatableWorkflowVersion();

    const isRequestedStep = (
      candidateStep: WorkflowAction,
    ): candidateStep is Extract<WorkflowAction, { type: TStepType }> =>
      candidateStep.id === stepId && candidateStep.type === stepType;

    const step = store.get(flowState)?.steps?.find(isRequestedStep);

    if (!isDefined(step)) {
      throw new Error(
        doNotTranslate(
          'Failed to find the step in the updatable workflow version',
        ),
      );
    }

    return step;
  };

  return {
    getUpdatableWorkflowVersion,
    getUpdatableWorkflowVersionStepOrThrow,
  };
};
