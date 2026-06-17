import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconFolder } from 'twenty-ui/display';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useAddFolderToNavigationMenu = () => {
  const { t } = useLingui();
  const { createItem } = useNavigationMenuItemEditController();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const handleAddFolder = () => {
    const itemId = createItem(
      {
        type: NavigationMenuItemType.FOLDER,
        name: t`New folder`,
        color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId ?? null,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: t`Edit folder`,
      pageIcon: IconFolder,
      focusTitleInput: true,
    });
  };

  return { handleAddFolder };
};
