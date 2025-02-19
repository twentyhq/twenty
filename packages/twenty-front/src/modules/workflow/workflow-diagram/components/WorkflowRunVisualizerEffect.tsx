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
  const setWorkflowVersionId = useSetRecoilState(workflowVersionIdState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setWorkflowVersionId(workflowVersionId);
  }, [setWorkflowVersionId, workflowVersionId]);

  useEffect(() => {
    if (!isDefined(workflowRun.output)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = generateWorkflowRunDiagram({
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
      stepsOutput: workflowRun.output.stepsOutput,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowRun.output]);

  return null;
};
