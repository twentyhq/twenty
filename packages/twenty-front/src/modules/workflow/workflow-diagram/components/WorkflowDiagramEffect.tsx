import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { flowState } from '@/workflow/states/flowState';
import { workflowLastCreatedStepIdState } from '@/workflow/states/workflowLastCreatedStepIdState';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';

import { addCreateStepNodes } from '@/workflow/workflow-diagram/utils/addCreateStepNodes';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { markLeafNodes } from '@/workflow/workflow-diagram/utils/markLeafNodes';
import { mergeWorkflowDiagrams } from '@/workflow/workflow-diagram/utils/mergeWorkflowDiagrams';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowDiagramEffect = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);
  const setFlow = useSetRecoilState(flowState);

  const computeAndMergeNewWorkflowDiagram = useRecoilCallback(
    ({ snapshot, set }) => {
      return (currentVersion: WorkflowVersion) => {
        const previousWorkflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );

        const nextWorkflowDiagram = markLeafNodes(
          addCreateStepNodes(getWorkflowVersionDiagram(currentVersion)),
        );

        let mergedWorkflowDiagram = nextWorkflowDiagram;
        if (isDefined(previousWorkflowDiagram)) {
          mergedWorkflowDiagram = mergeWorkflowDiagrams(
            previousWorkflowDiagram,
            nextWorkflowDiagram,
          );
        }

        const lastCreatedStepId = getSnapshotValue(
          snapshot,
          workflowLastCreatedStepIdState,
        );
        if (isDefined(lastCreatedStepId)) {
          mergedWorkflowDiagram.nodes = mergedWorkflowDiagram.nodes.map(
            (node) => {
              return {
                ...node,
                selected: node.id === lastCreatedStepId,
              };
            },
          );

          set(workflowLastCreatedStepIdState, undefined);
        }

        set(workflowDiagramState, mergedWorkflowDiagram);
      };
    },
    [],
  );

  useEffect(() => {
    const currentVersion = workflowWithCurrentVersion?.currentVersion;
    if (!isDefined(currentVersion)) {
      setFlow(undefined);
      setWorkflowDiagram(undefined);

      return;
    }

    setFlow({
      trigger: currentVersion.trigger,
      steps: currentVersion.steps,
    });

    computeAndMergeNewWorkflowDiagram(currentVersion);
  }, [
    computeAndMergeNewWorkflowDiagram,
    setFlow,
    setWorkflowDiagram,
    workflowWithCurrentVersion?.currentVersion,
  ]);

  return null;
};
