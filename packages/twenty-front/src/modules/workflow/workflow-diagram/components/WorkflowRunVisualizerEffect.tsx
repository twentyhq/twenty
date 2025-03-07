import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { flowState } from '@/workflow/states/flowState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowRunVisualizerEffect = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });

  const setWorkflowRunId = useSetRecoilState(workflowRunIdState);
  const setFlow = useSetRecoilState(flowState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    setWorkflowRunId(workflowRunId);
  }, [setWorkflowRunId, workflowRunId]);

  useEffect(() => {
    if (!isDefined(workflowRun?.output)) {
      setFlow(undefined);
      setWorkflowDiagram(undefined);

      return;
    }

    setFlow({
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
    });

    const nextWorkflowDiagram = generateWorkflowRunDiagram({
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
      stepsOutput: workflowRun.output.stepsOutput,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setFlow, setWorkflowDiagram, workflowRun?.output]);

  return null;
};
