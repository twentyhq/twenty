import styled from '@emotion/styled';

export const HoverableMenuItem = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0);
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
    background: rgba(0, 0, 0, 0.04);
  }
`;
