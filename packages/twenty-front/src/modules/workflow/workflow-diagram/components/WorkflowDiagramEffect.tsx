import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
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
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowDiagramEffect = () => {
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const workflowDiagram = useRecoilComponentStateCallbackStateV2(
    workflowDiagramComponentState,
  );
  const setFlow = useSetRecoilComponentStateV2(flowComponentState);
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const workflowLastCreatedStepId = useRecoilComponentStateCallbackStateV2(
    workflowLastCreatedStepIdComponentState,
  );

  const store = useStore();
  const currentVersion = workflowWithCurrentVersion?.currentVersion;

  const computeAndMergeNewWorkflowDiagram = useCallback(
    (version: WorkflowVersion) => {
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

    setFlow({
      workflowVersionId: currentVersion.id,
      trigger: currentVersion.trigger,
      steps: currentVersion.steps,
    });

    computeAndMergeNewWorkflowDiagram(currentVersion);
  }, [computeAndMergeNewWorkflowDiagram, setFlow, currentVersion]);

  useEffect(() => {
    if (!isDefined(currentVersion)) {
      return;
    }

    populateStepsOutputSchema(currentVersion);
  }, [currentVersion, populateStepsOutputSchema]);

  return null;
};
