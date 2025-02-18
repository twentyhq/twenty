import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { workflowVersionIdState } from '@/workflow/states/workflowVersionIdState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowRunVisualizerEffect = ({
  workflowVersionId,
  workflowRun,
}: {
  workflowVersionId: string;
  workflowRun: WorkflowRun;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const setWorkflowVersionId = useSetRecoilState(workflowVersionIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setWorkflowVersionId(workflowVersionId);
  }, [setWorkflowVersionId, workflowVersionId]);

  useEffect(() => {
    if (
      !(
        isDefined(workflowVersion) &&
        isDefined(workflowVersion.trigger) &&
        isDefined(workflowVersion.steps)
      )
    ) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = generateWorkflowRunDiagram({
      trigger: workflowVersion.trigger,
      steps: workflowVersion.steps,
      output: workflowRun.output,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowRun.output, workflowVersion]);

  return null;
};
