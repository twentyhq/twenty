import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconLayoutSidebarRightExpand } from 'twenty-ui';

const StyledButton = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing(2)};
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledButtonLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export const RecordIndexActionMenuBarAllActionsButton = () => {
  const theme = useTheme();
  const { openCommandMenu } = useCommandMenu();
  return (
    <StyledButton onClick={() => openCommandMenu()}>
      <IconLayoutSidebarRightExpand size={theme.icon.size.md} />
      <StyledButtonLabel>All Actions</StyledButtonLabel>
    </StyledButton>
  );
};
