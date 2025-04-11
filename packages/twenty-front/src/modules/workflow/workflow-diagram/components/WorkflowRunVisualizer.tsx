import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  height: 100%;
`;

export const WorkflowRunVisualizer = () => {
  return (
    <StyledContainer>
      <WorkflowRunDiagramCanvas />
    </StyledContainer>
  );
};
