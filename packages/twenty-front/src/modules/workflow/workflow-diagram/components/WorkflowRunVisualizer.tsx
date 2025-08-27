import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
import { workflowDiagramStatusComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusComponentState';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  height: 100%;
`;

export const WorkflowRunVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });
  const workflowDiagramStatus = useRecoilComponentValue(
    workflowDiagramStatusComponentState,
  );

  if (
    !isDefined(workflowRun) ||
    workflowDiagramStatus === 'computing-diagram'
  ) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowRunDiagramCanvas workflowRunStatus={workflowRun.status} />
    </StyledContainer>
  );
};
