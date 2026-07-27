import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
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
  id?: string;
  isUnfolded?: boolean;
  isActive?: boolean;
};

export const HeaderDropdownButton = ({
  children,
  id,
  isUnfolded,
  isActive,
}: HeaderDropdownButtonProps) => {
  const { dropdownOptionsId, isDropdownOpen } = useDropdownTriggerAria();

  return (
    <StyledHeaderDropdownButton
      type="button"
      id={id}
      isUnfolded={isUnfolded}
      isActive={isActive}
      aria-haspopup={isDefined(dropdownOptionsId) ? 'listbox' : undefined}
      aria-expanded={isDefined(dropdownOptionsId) ? isDropdownOpen : undefined}
      aria-controls={dropdownOptionsId}
    >
      {children}
    </StyledHeaderDropdownButton>
  );
};
