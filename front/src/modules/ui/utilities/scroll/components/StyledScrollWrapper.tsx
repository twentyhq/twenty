import styled from '@emotion/styled';

export const StyledScrollWrapper = styled.div`
  display: flex;
  height: 100%;
  overflow: auto;
  width: 100%;

  &.scrolling::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border.color.medium};
  }
`;
