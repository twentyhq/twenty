import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowRunIdState } from '@/workflow/states/workflowRunIdState';
import { WorkflowRunOutput } from '@/workflow/types/Workflow';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowRunStepToOpenByDefaultState } from '@/workflow/workflow-diagram/states/workflowRunStepToOpenByDefaultState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import { selectWorkflowDiagramNode } from '@/workflow/workflow-diagram/utils/selectWorkflowDiagramNode';
import { useContext, useEffect } from 'react';
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

  const flowState = useRecoilComponentCallbackStateV2(flowComponentState);

  const { populateStepsOutputSchema } = useStepsOutputSchema();

  const { isInRightDrawer } = useContext(ActionMenuContext);

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
        skipNodeSelection,
      }: {
        workflowRunOutput: WorkflowRunOutput | undefined;
        workflowVersionId: string | undefined;
        skipNodeSelection: boolean;
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

        const { diagram: baseWorkflowRunDiagram, stepToOpenByDefault } =
          generateWorkflowRunDiagram({
            trigger: workflowRunOutput.flow.trigger,
            steps: workflowRunOutput.flow.steps,
            stepsOutput: workflowRunOutput.stepsOutput,
          });

        if (isDefined(stepToOpenByDefault) && !skipNodeSelection) {
          const workflowRunDiagram = selectWorkflowDiagramNode({
            diagram: baseWorkflowRunDiagram,
            nodeIdToSelect: stepToOpenByDefault.id,
          });

          set(workflowDiagramState, workflowRunDiagram);
          set(workflowRunStepToOpenByDefaultState, {
            id: stepToOpenByDefault.id,
            data: stepToOpenByDefault.data,
          });
        } else {
          set(workflowDiagramState, baseWorkflowRunDiagram);
        }

        set(workflowDiagramStatusState, 'computing-dimensions');
      },
    [flowState],
  );

  useEffect(() => {
    handleWorkflowRunDiagramGeneration({
      workflowRunOutput: workflowRun?.output ?? undefined,
      workflowVersionId: workflowRun?.workflowVersionId,
      skipNodeSelection: isInRightDrawer,
    });
  }, [
    handleWorkflowRunDiagramGeneration,
    isInRightDrawer,
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
