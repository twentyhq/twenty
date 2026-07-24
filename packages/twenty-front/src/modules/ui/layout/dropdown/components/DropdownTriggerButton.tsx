import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledDropdownTriggerButton = styled.button`
  align-items: center;
  appearance: none;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  font: inherit;
  margin: 0;
  padding: 0;
  text-align: inherit;
  width: 100%;
`;

type DropdownTriggerButtonProps = {
  children: ReactNode;
  className?: string;
};

export const DropdownTriggerButton = ({
  children,
  className,
}: DropdownTriggerButtonProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  return (
    <StyledDropdownTriggerButton
      type="button"
      className={className}
      aria-haspopup={true}
      aria-expanded={isDropdownOpen}
      aria-controls={`${dropdownId}-options`}
    >
      {children}
    </StyledDropdownTriggerButton>
  );
};
