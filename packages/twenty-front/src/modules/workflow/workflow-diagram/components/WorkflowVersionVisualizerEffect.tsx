import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setFlow = useSetRecoilComponentStateV2(flowComponentState);
  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetRecoilComponentStateV2(
    workflowVisualizerWorkflowIdComponentState,
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
  }, [setFlow, setWorkflowVisualizerWorkflowId, workflowVersion]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = getWorkflowVersionDiagram(workflowVersion);

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
