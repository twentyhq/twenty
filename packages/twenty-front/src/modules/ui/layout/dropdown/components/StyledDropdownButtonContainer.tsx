import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

import { BUTTON_RESET_STYLE } from '@/ui/theme/constants/ButtonResetStyle';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive?: boolean;
  transparentBackground?: boolean;
};

export const StyledDropdownButtonContainer = styled.button<StyledDropdownButtonProps>`
  ${BUTTON_RESET_STYLE}
  align-items: center;
  background: ${({ isUnfolded, transparentBackground }) =>
    transparentBackground
      ? 'none'
      : isUnfolded
        ? themeCssVariables.background.transparent.light
        : themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  display: flex;

  padding: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};

  padding-right: ${themeCssVariables.spacing[2]};
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
