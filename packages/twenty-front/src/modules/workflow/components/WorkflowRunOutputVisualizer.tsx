import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { workflowVersionIdState } from '@/workflow/states/workflowVersionIdState';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonly';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

const StyledSourceCodeContainer = styled.div`
  height: 100%;
  margin: ${({ theme }) => theme.spacing(4)};
`;

const WorkflowRunVisualizerEffect = ({
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
    if (!isDefined(workflowVersion)) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = generateWorkflowRunDiagram({
      trigger: workflowVersion.trigger!,
      steps: workflowVersion.steps!,
      output: workflowRun.output,
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [setWorkflowDiagram, workflowVersion]);

  return null;
};

const WorkflowRunVisualizer = ({
  workflowRun,
}: {
  workflowRun: WorkflowRun;
}) => {
  const workflowVersion = useWorkflowVersion(workflowRun.workflowVersionId);
  if (!isDefined(workflowVersion)) {
    return null;
  }

  return (
    <>
      <WorkflowRunVisualizerEffect
        workflowRun={workflowRun}
        workflowVersionId={workflowVersion.id}
      />

      <WorkflowDiagramCanvasReadonly versionStatus={workflowVersion.status} />
    </>
  );
};

export const WorkflowRunOutputVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });
  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <StyledSourceCodeContainer>
      <WorkflowRunVisualizer workflowRun={workflowRun} />
    </StyledSourceCodeContainer>
  );
};
