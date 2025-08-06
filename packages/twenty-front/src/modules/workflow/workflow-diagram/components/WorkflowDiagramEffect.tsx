import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowLastCreatedStepIdComponentState } from '@/workflow/states/workflowLastCreatedStepIdComponentState';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';

import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { mergeWorkflowDiagrams } from '@/workflow/workflow-diagram/utils/mergeWorkflowDiagrams';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowDiagramEffect = ({
  workflowWithCurrentVersion,
}: {
  workflowWithCurrentVersion: WorkflowWithCurrentVersion | undefined;
}) => {
  const workflowDiagramState = useRecoilComponentCallbackState(
    workflowDiagramComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );
  const setFlow = useSetRecoilComponentState(flowComponentState);
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const workflowLastCreatedStepIdState = useRecoilComponentCallbackState(
    workflowLastCreatedStepIdComponentState,
  );

  const isWorkflowFilteringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_FILTERING_ENABLED,
  );

  const computeAndMergeNewWorkflowDiagram = useRecoilCallback(
    ({ snapshot, set }) => {
      return (currentVersion: WorkflowVersion) => {
        const previousWorkflowDiagram = getSnapshotValue(
          snapshot,
          workflowDiagramState,
        );

        const nextWorkflowDiagram = getWorkflowVersionDiagram({
          workflowVersion: currentVersion,
          isWorkflowFilteringEnabled,
          isEditable: true,
        });

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
    [
      workflowDiagramState,
      isWorkflowFilteringEnabled,
      workflowLastCreatedStepIdState,
    ],
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

    populateStepsOutputSchema(currentVersion);
  }, [currentVersion, populateStepsOutputSchema]);

  return null;
};
