import styled from '@emotion/styled';

export const StyledRightDrawerTopBar = styled.div<{
  isRightDrawerMinimized: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ isRightDrawerMinimized }) =>
    isRightDrawerMinimized ? '40px' : '56px'};
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  cursor: ${({ isRightDrawerMinimized }) =>
    isRightDrawerMinimized ? 'pointer' : 'default'};
`;
