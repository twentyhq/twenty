import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { themeCssVariables } from 'twenty-ui/theme';
import { styled } from '@linaria/react';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
  isActive?: boolean;
  transparentBackground?: boolean;
};

export const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
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
  cursor: pointer;
  display: flex;

  padding: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};

  padding-right: ${themeCssVariables.spacing[2]};
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
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
