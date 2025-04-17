import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowState } from '@/workflow/states/flowState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowStepToOpenByDefaultState } from '@/workflow/workflow-diagram/states/workflowStepToOpenByDefaultState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
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

  const handleWorkflowRunDiagramGeneration = useRecoilCallback(
    ({ set }) =>
      ({
        workflowRunOutput,
        workflowVersionId,
      }: {
        workflowRunOutput: WorkflowRunOutput | undefined;
        workflowVersionId: string | undefined;
      }) => {
        if (!(isDefined(workflowRunOutput) && isDefined(workflowVersionId))) {
          set(flowState, undefined);
          set(workflowDiagramState, undefined);

          return;
        }

        set(workflowDiagramStatusState, 'computing-diagram');

        set(flowState, {
          workflowVersionId,
          trigger: workflowRunOutput.flow.trigger,
          steps: workflowRunOutput.flow.steps,
        });

        const { diagram: nextWorkflowDiagram, stepToOpenByDefault } =
          generateWorkflowRunDiagram({
            trigger: workflowRunOutput.flow.trigger,
            steps: workflowRunOutput.flow.steps,
            stepsOutput: workflowRunOutput.stepsOutput,
          });

        set(workflowDiagramState, nextWorkflowDiagram);
        set(workflowDiagramStatusState, 'computing-dimensions');

        if (isDefined(stepToOpenByDefault)) {
          set(workflowStepToOpenByDefaultState, {
            id: stepToOpenByDefault.id,
            data: stepToOpenByDefault.data,
          });
        }
      },
    [],
  );

  useEffect(() => {
    handleWorkflowRunDiagramGeneration({
      workflowRunOutput: workflowRun?.output ?? undefined,
      workflowVersionId: workflowRun?.workflowVersionId,
    });
  }, [
    handleWorkflowRunDiagramGeneration,
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
