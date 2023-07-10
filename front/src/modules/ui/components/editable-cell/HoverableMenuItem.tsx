import styled from '@emotion/styled';

export const HoverableMenuItem = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 100%;
  position: relative;
  transition: background 0.1s ease;
  user-select: none;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;
