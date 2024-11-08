import { getActionBarIdFromActionMenuId } from '@/action-menu/utils/getActionBarIdFromActionMenuId';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { useBottomBar } from '@/ui/layout/bottom-bar/hooks/useBottomBar';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';

export const useActionMenu = (actionMenuId: string) => {
  const { openDropdown, closeDropdown } = useDropdownV2();
  const { openBottomBar, closeBottomBar } = useBottomBar();

  const actionBarId = getActionBarIdFromActionMenuId(actionMenuId);
  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const openActionMenuDropdown = () => {
    closeBottomBar(actionBarId);
    openDropdown(actionMenuDropdownId);
  };

  const openActionBar = () => {
    closeDropdown(actionMenuDropdownId);
    openBottomBar(actionBarId);
  };

  const closeActionMenuDropdown = () => {
    closeDropdown(actionMenuDropdownId);
  };

  const closeActionBar = () => {
    closeBottomBar(actionBarId);
  };

  return {
    openActionMenuDropdown,
    openActionBar,
    closeActionBar,
    closeActionMenuDropdown,
  };
};
