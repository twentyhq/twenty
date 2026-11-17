import { useEffect } from 'react';

import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

type NavigationMenuItemDropdownOpenEffectProps = {
  dropdownId: string;
  onOpen: () => void;
};

export const NavigationMenuItemDropdownOpenEffect = ({
  dropdownId,
  onOpen,
}: NavigationMenuItemDropdownOpenEffectProps) => {
  const { openDropdown } = useOpenDropdown();

  useEffect(() => {
    onOpen();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, onOpen, openDropdown]);

  return null;
};
