import styled from '@emotion/styled';

const StyledWorkflowStepBody = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  padding: ${({ theme }) => theme.spacing(4)};
  row-gap: ${({ theme }) => theme.spacing(6)};
`;

export { StyledWorkflowStepBody as WorkflowStepBody };
