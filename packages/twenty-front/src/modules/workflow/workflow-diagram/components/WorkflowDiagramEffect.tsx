import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';

import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
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
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const workflowLastCreatedStepId = useAtomComponentStateCallbackState(
    workflowLastCreatedStepIdComponentState,
  );

  const store = useStore();
  const currentVersion = workflowWithCurrentVersion?.currentVersion;

  const [previousVersionId, setPreviousVersionId] = useState<string>();

  const computeAndMergeNewWorkflowDiagram = useCallback(
    (version: WorkflowVersion, preservePositions: boolean) => {
      const previousWorkflowDiagram = store.get(workflowDiagram);

      const nextWorkflowDiagram = getWorkflowVersionDiagram({
        workflowVersion: version,
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
    if (!isDefined(currentVersion)) {
      return;
    }

    const isSameVersion = previousVersionId === currentVersion.id;
    const isTransitionToDraft = currentVersion.status === 'DRAFT';
    const shouldPreservePositions = isSameVersion || isTransitionToDraft;

    setPreviousVersionId(currentVersion.id);

    setFlow({
      workflowVersionId: currentVersion.id,
      trigger: currentVersion.trigger,
      steps: currentVersion.steps,
    });

    computeAndMergeNewWorkflowDiagram(currentVersion, shouldPreservePositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeAndMergeNewWorkflowDiagram, setFlow, currentVersion]);

  useEffect(() => {
    if (!isDefined(currentVersion)) {
      return;
    }

    populateStepsOutputSchema(currentVersion);
  }, [currentVersion, populateStepsOutputSchema]);

  return null;
};
