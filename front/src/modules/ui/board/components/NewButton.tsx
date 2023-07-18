import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPlus } from '@/ui/icon/index';

const StyledButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
  }
`;

type OwnProps = {
  onClick: () => void;
};

export function NewButton({ onClick }: OwnProps) {
  const theme = useTheme();

  return (
    <StyledButton onClick={onClick}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledButton>
  );
}
