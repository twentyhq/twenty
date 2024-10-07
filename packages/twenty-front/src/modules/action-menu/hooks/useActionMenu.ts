import { useBottomBar } from '@/ui/layout/bottom-bar/hooks/useBottomBar';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';

export const useActionMenu = (actionMenuId: string) => {
  const { openDropdown, closeDropdown } = useDropdownV2();
  const { openBottomBar, closeBottomBar } = useBottomBar();

  const openActionMenuDropdown = () => {
    closeBottomBar(`action-bar-${actionMenuId}`);
    openDropdown(`action-menu-dropdown-${actionMenuId}`);
  };

  const openActionBar = () => {
    closeDropdown(`action-menu-dropdown-${actionMenuId}`);
    openBottomBar(`action-bar-${actionMenuId}`);
  };

  const closeActionMenuDropdown = () => {
    closeDropdown(`action-menu-dropdown-${actionMenuId}`);
  };

  const closeActionBar = () => {
    closeBottomBar(`action-bar-${actionMenuId}`);
  };

  return {
    openActionMenuDropdown,
    openActionBar,
    closeActionBar,
    closeActionMenuDropdown,
  };
};
