import styled from '@emotion/styled';

const StyledWorkflowStepBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: ${({ theme }) => theme.spacing(4)};
  row-gap: ${({ theme }) => theme.spacing(6)};
  flex: 1 1 auto;
  height: 100%;
`;

export { StyledWorkflowStepBody as WorkflowStepBody };
