import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setFlow = useSetAtomComponentState(flowComponentState);
  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetAtomComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowVersionId = useSetAtomComponentState(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const { populateStepsOutputSchema } = useStepsOutputSchema();

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
      workflowContext: 'workflow-version',
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowVersion]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
