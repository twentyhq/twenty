import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useDropdownTriggerAria } from '@/ui/layout/dropdown/hooks/useDropdownTriggerAria';
import { BUTTON_RESET_STYLE } from '@/ui/theme/constants/ButtonResetStyle';

const StyledHeaderDropdownButton = styled.button<{
  isUnfolded?: boolean;
  isActive?: boolean;
}>`
  ${BUTTON_RESET_STYLE}
  align-items: center;
  background: ${({ isUnfolded }) =>
    isUnfolded
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.secondary};
  display: flex;

  padding: ${themeCssVariables.spacing[1]};

  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

  user-select: none;

  &:hover {
    background: ${({ isUnfolded }) =>
      isUnfolded
        ? themeCssVariables.background.transparent.medium
        : themeCssVariables.background.transparent.light};
  }
`;

type HeaderDropdownButtonProps = {
  children: ReactNode;
  dropdownId?: string;
  id?: string;
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const HeaderDropdownButton = ({
  children,
  dropdownId,
  id,
  isUnfolded,
  isActive,
}: HeaderDropdownButtonProps) => {
  const { ariaHasPopup, ariaExpanded, ariaControls } =
    useDropdownTriggerAria(dropdownId);

  return (
    <StyledHeaderDropdownButton
      type="button"
      id={id}
      isUnfolded={isUnfolded}
      isActive={isActive}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </StyledHeaderDropdownButton>
  );
};
