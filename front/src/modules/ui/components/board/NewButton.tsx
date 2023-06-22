import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPlus } from '@/ui/icons/index';

const StyledButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${({ theme }) => theme.primaryBackground};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.text40};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${(props) => props.theme.spacing(1)};

  &:hover {
    background-color: ${({ theme }) => theme.secondaryBackground};
  }
`;

type OwnProps = {
  onClick: () => void;
};

export function NewButton({ onClick }: OwnProps) {
  const theme = useTheme();

  return (
    <StyledButton onClick={onClick}>
      <IconPlus size={theme.iconSizeMedium} />
      New
    </StyledButton>
  );
}
