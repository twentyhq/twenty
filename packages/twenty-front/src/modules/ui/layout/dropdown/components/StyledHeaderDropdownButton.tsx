import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type StyledDropdownButtonProps = {
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const StyledHeaderDropdownButton = styled.button<StyledDropdownButtonProps>`
  font-family: inherit;
  align-items: center;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;

  padding: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};

  padding-right: ${themeCssVariables.spacing[2]};
  user-select: none;

  background: ${({ isUnfolded }) =>
    isUnfolded
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};

  &:hover {
    background: ${({ isUnfolded }) =>
      isUnfolded
        ? themeCssVariables.background.transparent.medium
        : themeCssVariables.background.transparent.light};
  }
`;
