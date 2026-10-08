import { useEffect } from 'react';

import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

type NavigationMenuItemLinkEditorOpenEffectProps = {
  dropdownId: string;
  onOpen: () => void;
};

// A link created from the add dropdown is selected by that dropdown, which
// cannot reach this row because it does not exist yet when the click happens.
export const NavigationMenuItemLinkEditorOpenEffect = ({
  dropdownId,
  onOpen,
}: NavigationMenuItemLinkEditorOpenEffectProps) => {
  const { openDropdown } = useOpenDropdown();

  useEffect(() => {
    onOpen();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  }, [dropdownId, onOpen, openDropdown]);

  return <></>;
};
