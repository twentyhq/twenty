import styled from '@emotion/styled';

const StyledWorkflowStepBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: ${({ theme }) => theme.spacing(6)};
  row-gap: ${({ theme }) => theme.spacing(6)};
`;

export { StyledWorkflowStepBody as WorkflowStepBody };
