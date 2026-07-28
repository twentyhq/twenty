import { isNonEmptyString } from '@sniptt/guards';

import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { getDropdownOptionsId } from '@/ui/layout/dropdown/utils/getDropdownOptionsId';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const OUTSIDE_DROPDOWN_FALLBACK_INSTANCE_ID = 'trigger-outside-dropdown';

export const useDropdownTriggerAria = (dropdownIdFromProps?: string) => {
  const dropdownInstanceIdFromContext = useAvailableComponentInstanceId(
    DropdownComponentInstanceContext,
  );

  const dropdownId = dropdownIdFromProps ?? dropdownInstanceIdFromContext;

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId ?? OUTSIDE_DROPDOWN_FALLBACK_INSTANCE_ID,
  );

  const isInsideDropdown = isNonEmptyString(dropdownId);

  return {
    ariaHasPopup: isInsideDropdown ? ('listbox' as const) : undefined,
    ariaExpanded: isInsideDropdown ? isDropdownOpen : undefined,
    ariaControls: isInsideDropdown
      ? getDropdownOptionsId(dropdownId)
      : undefined,
    isDropdownOpen,
  };
};
