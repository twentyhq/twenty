import styled from '@emotion/styled';

const StyledWorkflowStepBody = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(6)};
`;

export { StyledWorkflowStepBody as WorkflowStepBody };
