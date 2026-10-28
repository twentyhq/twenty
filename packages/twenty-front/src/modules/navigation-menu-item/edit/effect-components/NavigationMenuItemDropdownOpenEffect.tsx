import { useEffect } from 'react';

import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

type NavigationMenuItemDropdownOpenEffectProps = {
  dropdownId: string;
  onOpen: () => void;
};

// An item created from an add menu is selected by that menu, which cannot
// reach this row because it does not exist yet when the click happens.
export const NavigationMenuItemDropdownOpenEffect = ({
  dropdownId,
  onOpen,
}: NavigationMenuItemDropdownOpenEffectProps) => {
  const { openDropdown } = useOpenDropdown();

  useEffect(() => {
    onOpen();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, onOpen, openDropdown]);

  return <></>;
};
