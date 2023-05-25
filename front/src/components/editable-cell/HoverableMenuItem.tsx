import styled from '@emotion/styled';

export const HoverableMenuItem = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0);
  transition: background 0.1s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;
