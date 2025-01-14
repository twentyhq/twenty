import styled from '@emotion/styled';

type StyledDropdownButtonProps = {
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const StyledHeaderDropdownButton = styled.button<StyledDropdownButtonProps>`
  font-family: inherit;
  align-items: center;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  cursor: pointer;
  display: flex;

  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  background: ${({ theme, isUnfolded }) =>
    isUnfolded ? theme.background.transparent.light : theme.background.primary};

  &:hover {
    background: ${({ theme, isUnfolded }) =>
      isUnfolded
        ? theme.background.transparent.medium
        : theme.background.transparent.light};
  }
`;
