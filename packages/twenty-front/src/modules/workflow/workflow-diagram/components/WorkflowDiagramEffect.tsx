import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import { workflowFailedFlowKeysComponentState } from '@/workflow/states/workflowFailedFlowKeysComponentState';
import { workflowFlowSaveDraftVersionIdComponentState } from '@/workflow/states/workflowFlowSaveDraftVersionIdComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { buildFlowWithLocalEdits } from '@/workflow/utils/buildFlowWithLocalEdits';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useWorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';

import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { mergeWorkflowDiagrams } from '@/workflow/workflow-diagram/utils/mergeWorkflowDiagrams';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowDiagramEffect = () => {
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const workflowDiagram = useAtomComponentStateCallbackState(
    workflowDiagramComponentState,
  );
  const setFlow = useSetAtomComponentState(flowComponentState);
  const flow = useAtomComponentStateValue(flowComponentState);
  const { populateStepsOutputSchema, deleteStepsOutputSchema } =
    useStepsOutputSchema();

  const workflowLastCreatedStepId = useAtomComponentStateCallbackState(
    workflowLastCreatedStepIdComponentState,
  );

  const store = useStore();
  const currentVersion = workflowWithCurrentVersion?.currentVersion;

  const { content, refetchContent, contentUpdatedAt } =
    useWorkflowVersionContent(currentVersion?.id);

  const [shouldWorkflowRefetchRequest, setShouldWorkflowRefetchRequest] =
    useAtomFamilyState(
      shouldWorkflowRefetchRequestFamilyState,
      workflowVisualizerWorkflowId ?? '',
    );

  const [shouldSeedFlowFromServer, setShouldSeedFlowFromServer] =
    useState(false);
  const [lastCurrentVersionId, setLastCurrentVersionId] = useState<string>();
  const [seededVersionUpdatedAt, setSeededVersionUpdatedAt] =
    useState<string>();

  const unsavedFlowKeys = useAtomComponentStateCallbackState(
    workflowUnsavedFlowKeysComponentState,
  );
  const flowSaveInProgress = useAtomComponentStateCallbackState(
    workflowFlowSaveInProgressComponentState,
  );
  const failedFlowKeys = useAtomComponentStateCallbackState(
    workflowFailedFlowKeysComponentState,
  );
  const saveDraftVersionId = useAtomComponentStateCallbackState(
    workflowFlowSaveDraftVersionIdComponentState,
  );
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow();
  const [previousDiagramUpdatedAt, setPreviousDiagramUpdatedAt] =
    useState<string>();
  const [previousDiagramVersionId, setPreviousDiagramVersionId] =
    useState<string>();

  const computeAndMergeNewWorkflowDiagram = useCallback(
    (
      flowToRender: {
        trigger: WorkflowTrigger | null;
        steps: WorkflowAction[] | null;
      },
      preservePositions: boolean,
    ) => {
      const previousWorkflowDiagram = store.get(workflowDiagram);

      const nextWorkflowDiagram = generateWorkflowDiagram({
        trigger: flowToRender.trigger ?? undefined,
        steps: flowToRender.steps ?? [],
        workflowContext: 'workflow',
      });

      let mergedWorkflowDiagram = nextWorkflowDiagram;

      if (isDefined(previousWorkflowDiagram)) {
        mergedWorkflowDiagram = mergeWorkflowDiagrams(
          previousWorkflowDiagram,
          nextWorkflowDiagram,
          { preservePositions },
        );
      }

      const lastCreatedStepId = store.get(workflowLastCreatedStepId);

      if (isDefined(lastCreatedStepId)) {
        mergedWorkflowDiagram.nodes = mergedWorkflowDiagram.nodes.map(
          (node) => {
            return {
              ...node,
              selected: node.id === lastCreatedStepId,
            };
          },
        );

        store.set(workflowLastCreatedStepId, undefined);
      }

      store.set(workflowDiagram, mergedWorkflowDiagram);
    },
    [workflowDiagram, workflowLastCreatedStepId, store],
  );

  useEffect(() => {
    if (!shouldWorkflowRefetchRequest || !isDefined(currentVersion?.id)) {
      return;
    }

    setShouldWorkflowRefetchRequest(false);

    void saveUnsavedWorkflowFlow()
      .then(() => refetchContent())
      .then(() => {
        setShouldSeedFlowFromServer(true);
      })
      .catch(() => {});
  }, [
    currentVersion?.id,
    shouldWorkflowRefetchRequest,
    setShouldWorkflowRefetchRequest,
    refetchContent,
    saveUnsavedWorkflowFlow,
  ]);

  useEffect(() => {
    if (!isDefined(currentVersion) || !isDefined(content)) {
      return;
    }

    if (content.workflowVersionId !== currentVersion.id) {
      return;
    }

    const isDraftVersion = currentVersion.status === 'DRAFT';

    if (
      !isDraftVersion &&
      store.get(saveDraftVersionId) === currentVersion.id
    ) {
      store.set(saveDraftVersionId, undefined);
    }

    const hasCurrentVersionChanged = lastCurrentVersionId !== currentVersion.id;

    if (!hasCurrentVersionChanged && !shouldSeedFlowFromServer) {
      return;
    }

    setLastCurrentVersionId(currentVersion.id);
    setShouldSeedFlowFromServer(false);

    // A save that created this draft already moved the flow onto it
    if (
      isDefined(lastCurrentVersionId) &&
      flow?.workflowVersionId === currentVersion.id &&
      !shouldSeedFlowFromServer
    ) {
      return;
    }

    if (isDefined(contentUpdatedAt)) {
      deleteStepsOutputSchema({
        workflowVersionId: currentVersion.id,
        stepIds: [
          TRIGGER_STEP_ID,
          ...(content.steps ?? []).map((step: WorkflowAction) => step.id),
        ],
      });
    }
    setSeededVersionUpdatedAt(contentUpdatedAt);

    const localFlowKeys = isDraftVersion
      ? [
          ...store.get(unsavedFlowKeys),
          ...store.get(failedFlowKeys),
          ...(store.get(flowSaveInProgress)?.flowKeys ?? []),
        ]
      : [];

    if (!isDraftVersion) {
      store.set(unsavedFlowKeys, []);
      store.set(failedFlowKeys, []);
    }

    setFlow((localFlow) =>
      buildFlowWithLocalEdits({
        serverFlow: {
          workflowVersionId: currentVersion.id,
          trigger: content.trigger,
          steps: content.steps,
        },
        localFlow,
        localFlowKeys,
      }),
    );
  }, [
    content,
    currentVersion,
    flow?.workflowVersionId,
    lastCurrentVersionId,
    shouldSeedFlowFromServer,
    contentUpdatedAt,
    setFlow,
    deleteStepsOutputSchema,
    store,
    saveDraftVersionId,
    unsavedFlowKeys,
    failedFlowKeys,
    flowSaveInProgress,
  ]);

  useEffect(() => {
    if (!isDefined(flow)) {
      return;
    }

    const isSameVersion = previousDiagramVersionId === flow.workflowVersionId;
    const isTransitionToDraft = currentVersion?.status === 'DRAFT';
    const shouldPreservePositions =
      (isSameVersion || isTransitionToDraft) &&
      previousDiagramUpdatedAt === seededVersionUpdatedAt;

    setPreviousDiagramVersionId(flow.workflowVersionId);
    setPreviousDiagramUpdatedAt(seededVersionUpdatedAt);

    computeAndMergeNewWorkflowDiagram(flow, shouldPreservePositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeAndMergeNewWorkflowDiagram, flow, seededVersionUpdatedAt]);

  useEffect(() => {
    if (!isDefined(currentVersion) || !isDefined(flow)) {
      return;
    }

    if (flow.workflowVersionId !== currentVersion.id) {
      return;
    }

    populateStepsOutputSchema({
      ...currentVersion,
      trigger: flow.trigger,
      steps: flow.steps,
    });
  }, [currentVersion, flow, populateStepsOutputSchema]);

  return null;
};
