import styled from '@emotion/styled';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive?: boolean;
  transparentBackground?: boolean;
};

export const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ theme, isUnfolded, transparentBackground }) =>
    transparentBackground
      ? 'none'
      : isUnfolded
        ? theme.background.transparent.light
        : theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  cursor: pointer;
  display: flex;

  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    background: ${({ theme, isUnfolded, transparentBackground }) =>
      transparentBackground
        ? 'transparent'
        : isUnfolded
          ? theme.background.transparent.medium
          : theme.background.transparent.light};
  }
`;
