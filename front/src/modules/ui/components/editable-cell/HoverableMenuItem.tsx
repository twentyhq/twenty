import styled from '@emotion/styled';

export const HoverableMenuItem = styled.div`
  align-items: center;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 100%;
  position: relative;
  transition: background 0.1s ease;
  user-select: none;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.lightBackgroundTransparent};
  }
`;
