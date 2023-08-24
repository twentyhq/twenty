import styled from '@emotion/styled';

export const StyledScrollWrapper = styled.div`
  display: flex;
  height: 100%;
  overflow: auto;
  width: 100%;

  &.scrolling::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
`;
