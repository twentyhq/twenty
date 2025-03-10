import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
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
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowDiagramEffect = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);
  const [flow, setFlow] = useRecoilState(flowState);
  const { resetStepsOutputSchema } = useStepsOutputSchema({
    instanceIdFromProps: workflowWithCurrentVersion?.currentVersion.id,
  });

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

  const currentVersion = workflowWithCurrentVersion?.currentVersion;
  useEffect(() => {
    if (!isDefined(currentVersion)) {
      setFlow(undefined);
      setWorkflowDiagram(undefined);

      return;
    }

    setFlow({
      workflowVersionId: currentVersion.id,
      trigger: currentVersion.trigger,
      steps: currentVersion.steps,
    });

    computeAndMergeNewWorkflowDiagram(currentVersion);
  }, [
    computeAndMergeNewWorkflowDiagram,
    setFlow,
    setWorkflowDiagram,
    currentVersion,
  ]);

  useEffect(() => {
    if (!isDefined(currentVersion)) {
      return;
    }

    const deletedSteps = flow?.steps?.filter((flowStep) => {
      if (!isDefined(currentVersion?.steps)) {
        return false;
      }

      return !currentVersion.steps.some(
        (versionStep) => versionStep.id === flowStep.id,
      );
    });

    if (isDefined(deletedSteps)) {
      deletedSteps.forEach((step) => {
        resetStepsOutputSchema({ stepId: step.id });
      });
    }

    if (!isDefined(currentVersion.trigger) && isDefined(flow?.trigger)) {
      resetStepsOutputSchema({ stepId: TRIGGER_STEP_ID });
    }
  }, [currentVersion, flow?.steps, flow?.trigger, resetStepsOutputSchema]);

  return null;
};
