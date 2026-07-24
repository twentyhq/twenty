import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledChipLabelButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  column-gap: ${themeCssVariables.spacing[1]};
  cursor: pointer;
  display: flex;
  font: inherit;
  margin: 0;
  padding: 0;
`;

type SortOrFilterChipDropdownTriggerLabelProps = {
  children: ReactNode;
  onClick?: () => void;
};

export const SortOrFilterChipDropdownTriggerLabel = ({
  children,
  onClick,
}: SortOrFilterChipDropdownTriggerLabelProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  return (
    <StyledChipLabelButton
      type="button"
      onClick={onClick}
      aria-haspopup={true}
      aria-expanded={isDropdownOpen}
      aria-controls={`${dropdownId}-options`}
    >
      {children}
    </StyledChipLabelButton>
  );
};
