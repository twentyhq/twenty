import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/icon';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { NAVIGATION_MENU_ITEM_SEARCH_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemSearchLink';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useAddSearchToNavigationMenu = () => {
  const { t } = useLingui();
  const { createItem } = useNavigationMenuItemEditController();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const handleAddSearch = () => {
    const itemId = createItem(
      {
        type: NavigationMenuItemType.LINK,
        name: t`Search`,
        link: NAVIGATION_MENU_ITEM_SEARCH_LINK,
        color: DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK,
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId ?? null,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );

    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: t`Edit search`,
      pageIcon: IconSearch,
      focusTitleInput: true,
    });
  };

  return { handleAddSearch };
};
