import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useDropdownTriggerAria } from '@/ui/layout/dropdown/hooks/useDropdownTriggerAria';
import { BUTTON_RESET_STYLE } from '@/ui/theme/constants/ButtonResetStyle';

const StyledDropdownTriggerButton = styled.button`
  ${BUTTON_RESET_STYLE}
  align-items: center;
  display: flex;
  min-width: 0;
  width: 100%;
`;

type DropdownTriggerButtonProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export const DropdownTriggerButton = ({
  children,
  className,
  ariaLabel,
  disabled,
}: DropdownTriggerButtonProps) => {
  const { dropdownOptionsId, isDropdownOpen } = useDropdownTriggerAria();

  return (
    <StyledDropdownTriggerButton
      type="button"
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-haspopup={isDefined(dropdownOptionsId) ? 'listbox' : undefined}
      aria-expanded={isDefined(dropdownOptionsId) ? isDropdownOpen : undefined}
      aria-controls={dropdownOptionsId}
    >
      {children}
    </StyledDropdownTriggerButton>
  );
};
