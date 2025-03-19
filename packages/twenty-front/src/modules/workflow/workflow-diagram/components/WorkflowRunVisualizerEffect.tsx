import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowState } from '@/workflow/states/flowState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
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
  const workflowVersion = useWorkflowVersion(workflowRun?.workflowVersionId);

  const setWorkflowRunId = useSetRecoilState(workflowRunIdState);
  const setWorkflowId = useSetRecoilState(workflowIdState);
  const setFlow = useSetRecoilState(flowState);
  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  useEffect(() => {
    setWorkflowRunId(workflowRunId);
  }, [setWorkflowRunId, workflowRunId]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      return;
    }
    setWorkflowId(workflowVersion.workflowId);
  }, [setWorkflowId, workflowVersion]);

  useEffect(() => {
    if (!isDefined(workflowRun?.output)) {
      setFlow(undefined);
      setWorkflowDiagram(undefined);

      return;
    }

    setFlow({
      workflowVersionId: workflowRun.workflowVersionId,
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
    });

    const nextWorkflowDiagram = generateWorkflowRunDiagram({
      trigger: workflowRun.output.flow.trigger,
      steps: workflowRun.output.flow.steps,
      stepsOutput: workflowRun.output.stepsOutput,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [
    setFlow,
    setWorkflowDiagram,
    workflowRun?.output,
    workflowRun?.workflowVersionId,
  ]);

  useEffect(() => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    populateStepsOutputSchema(workflowVersion);
  }, [populateStepsOutputSchema, workflowVersion]);

  return null;
};
