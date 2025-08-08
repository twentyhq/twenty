import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setFlow = useSetRecoilComponentState(flowComponentState);
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowVersionId = useSetRecoilComponentState(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const isWorkflowFilteringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_FILTERING_ENABLED,
  );

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setFlow(undefined);

      return;
    }

    setFlow({
      workflowVersionId: workflowVersion.id,
      trigger: workflowVersion.trigger,
      steps: workflowVersion.steps,
    });

    setWorkflowVisualizerWorkflowId(workflowVersion.workflowId);
    setWorkflowVisualizerWorkflowVersionId(workflowVersion.id);
  }, [
    setFlow,
    setWorkflowVisualizerWorkflowId,
    setWorkflowVisualizerWorkflowVersionId,
    workflowVersion,
  ]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = getWorkflowVersionDiagram({
      workflowVersion,
      isWorkflowFilteringEnabled,
      isEditable: false,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [isWorkflowFilteringEnabled, setWorkflowDiagram, workflowVersion]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
