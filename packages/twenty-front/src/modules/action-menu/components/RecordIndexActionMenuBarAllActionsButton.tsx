import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconLayoutSidebarRightExpand, getOsControlSymbol } from 'twenty-ui';

const StyledButton = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing(2)};
  transition: background ${({ theme }) => theme.animation.duration.fast} ease;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledShortcutLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSeparator = styled.div<{ size: 'sm' | 'md' }>`
  background: ${({ theme }) => theme.border.color.light};
  height: ${({ theme, size }) => theme.spacing(size === 'sm' ? 4 : 8)};
  margin: 0 ${({ theme }) => theme.spacing(1)};
  width: 1px;
`;

export const RecordIndexActionMenuBarAllActionsButton = () => {
  const theme = useTheme();
  const { openCommandMenu } = useCommandMenu();
  return (
    <>
      <StyledSeparator size="md" />
      <StyledButton onClick={() => openCommandMenu()}>
        <IconLayoutSidebarRightExpand size={theme.icon.size.md} />
        <StyledButtonLabel>All Actions</StyledButtonLabel>
        <StyledSeparator size="sm" />
        <StyledShortcutLabel>{getOsControlSymbol()}K</StyledShortcutLabel>
      </StyledButton>
    </>
  );
};
