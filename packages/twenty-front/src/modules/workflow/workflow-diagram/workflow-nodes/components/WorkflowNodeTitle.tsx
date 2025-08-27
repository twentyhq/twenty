import styled from '@emotion/styled';

const StyledNodeTitle = styled.div`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  display: -webkit-box;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export { StyledNodeTitle as WorkflowNodeTitle };
