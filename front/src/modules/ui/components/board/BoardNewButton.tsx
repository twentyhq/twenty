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
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.secondaryBackground};
  }
`;

export const NewButton = () => {
  const theme = useTheme();
  return (
    <StyledButton>
      <IconPlus size={theme.iconSizeMedium} />
      New
    </StyledButton>
  );
};
