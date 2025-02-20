import { flowState } from '@/workflow/states/flowState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const WorkflowRunVisualizerEffect = ({
  workflowRun,
}: {
  workflowRun: WorkflowRun;
}) => {
  const setFlow = useSetRecoilState(flowState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  useEffect(() => {
    if (!isDefined(workflowRun.output)) {
      setFlow(undefined);

      return;
    }

    setFlow({
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
    });
  }, [setFlow, workflowRun.output]);

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
