import { currentNavigationMenuItemFolderIdFamilyState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdFamilyState';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { getNavigationMenuTabFolderKey } from '@/navigation-menu-item/common/utils/getNavigationMenuTabFolderKey';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentNavigationMenuItemFolderId = () => {
  const currentNavigationMenuTabId = useAtomStateValue(
    currentNavigationMenuTabIdState,
  );

  return useAtomFamilyState(
    currentNavigationMenuItemFolderIdFamilyState,
    getNavigationMenuTabFolderKey(currentNavigationMenuTabId),
  );
};
