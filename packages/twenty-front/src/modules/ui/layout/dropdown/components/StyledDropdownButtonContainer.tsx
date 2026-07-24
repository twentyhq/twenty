import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive?: boolean;
  transparentBackground?: boolean;
};

export const StyledDropdownButtonContainer = styled.button<StyledDropdownButtonProps>`
  align-items: center;
  appearance: none;
  background: ${({ isUnfolded, transparentBackground }) =>
    transparentBackground
      ? 'none'
      : isUnfolded
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.primary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font: inherit;
  margin: 0;

  padding: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};

  padding-right: ${themeCssVariables.spacing[2]};
  text-align: inherit;
  user-select: none;

  &:hover {
    background: ${({ isUnfolded, transparentBackground }) =>
      transparentBackground
        ? 'transparent'
        : isUnfolded
          ? themeCssVariables.background.transparent.medium
          : themeCssVariables.background.transparent.light};
  }
`;
