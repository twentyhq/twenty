import styled from '@emotion/styled';

const StyledNodeIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

export { StyledNodeIconContainer as WorkflowNodeIconContainer };
