import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowState } from '@/workflow/states/flowState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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
  const setWorkflowDiagramStatus = useSetRecoilState(
    workflowDiagramStatusState,
  );
  const { populateStepsOutputSchema } = useStepsOutputSchema();

  useEffect(() => {
    setWorkflowRunId(workflowRunId);
  }, [setWorkflowRunId, workflowRunId]);

  useEffect(() => {
    if (!isDefined(workflowRun)) {
      return;
    }
    setWorkflowId(workflowRun.workflowId);
  }, [setWorkflowId, workflowRun]);

  useEffect(() => {
    console.log('in useEffect WorkflowRunVisualizerEffect');

    setWorkflowDiagramStatus('computing-diagram');

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
    setWorkflowDiagramStatus('computing-dimensions');
  }, [
    setFlow,
    setWorkflowDiagram,
    setWorkflowDiagramStatus,
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
