import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { normalizeUrl } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';

import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorLink';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useAddLinkToNavigationMenu = () => {
  const { t } = useLingui();
  const { createItem } = useNavigationMenuItemEditController();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const handleAddLink = () => {
    const itemId = createItem(
      {
        type: NavigationMenuItemType.LINK,
        name: t`Link label`,
        link: normalizeUrl('www.example.com'),
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
      pageTitle: t`Edit link`,
      pageIcon: IconLink,
      focusTitleInput: true,
    });
  };

  return { handleAddLink };
};
