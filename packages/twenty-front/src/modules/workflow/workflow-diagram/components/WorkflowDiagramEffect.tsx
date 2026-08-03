import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
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
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const workflowLastCreatedStepId = useAtomComponentStateCallbackState(
    workflowLastCreatedStepIdComponentState,
  );

  const store = useStore();
  const currentVersion = workflowWithCurrentVersion?.currentVersion;

  const { content, refetchContent } = useWorkflowVersionContent(
    currentVersion?.id,
  );

  const [shouldWorkflowRefetchRequest, setShouldWorkflowRefetchRequest] =
    useAtomFamilyState(
      shouldWorkflowRefetchRequestFamilyState,
      workflowVisualizerWorkflowId ?? '',
    );

  const [seededVersionId, setSeededVersionId] = useState<string>();
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
    if (!shouldWorkflowRefetchRequest) {
      return;
    }

    setShouldWorkflowRefetchRequest(false);

    void refetchContent()
      .then(() => {
        setSeededVersionId(undefined);
      })
      .catch(() => {});
  }, [
    shouldWorkflowRefetchRequest,
    setShouldWorkflowRefetchRequest,
    refetchContent,
  ]);

  useEffect(() => {
    if (!isDefined(currentVersion) || !isDefined(content)) {
      return;
    }

    if (content.workflowVersionId !== currentVersion.id) {
      return;
    }

    if (seededVersionId === currentVersion.id) {
      return;
    }

    setSeededVersionId(currentVersion.id);

    setFlow({
      workflowVersionId: currentVersion.id,
      trigger: content.trigger,
      steps: content.steps,
    });
  }, [content, currentVersion, seededVersionId, setFlow]);

  useEffect(() => {
    if (!isDefined(flow)) {
      return;
    }

    const isSameVersion = previousDiagramVersionId === flow.workflowVersionId;
    const isTransitionToDraft = currentVersion?.status === 'DRAFT';
    const shouldPreservePositions = isSameVersion || isTransitionToDraft;

    setPreviousDiagramVersionId(flow.workflowVersionId);

    computeAndMergeNewWorkflowDiagram(flow, shouldPreservePositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeAndMergeNewWorkflowDiagram, flow]);

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
