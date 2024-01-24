import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPlus } from '@/ui/display/icon/index';

const StyledButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

type NewButtonProps = {
  onClick: () => void;
};

export const NewButton = ({ onClick }: NewButtonProps) => {
  const theme = useTheme();

  return (
    <StyledButton onClick={onClick}>
      <IconPlus size={theme.icon.size.md} />
      New
    </StyledButton>
  );
};
