import { useEffect } from 'react';

import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

type NavigationMenuItemContainerMenuOpenEffectProps = {
  dropdownId: string;
  onOpen: () => void;
};

export const NavigationMenuItemContainerMenuOpenEffect = ({
  dropdownId,
  onOpen,
}: NavigationMenuItemContainerMenuOpenEffectProps) => {
  const { openDropdown } = useOpenDropdown();

  useEffect(() => {
    onOpen();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, onOpen, openDropdown]);

  return <></>;
};
