import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCreateNavigationMenuTabOrSection = () => {
  const { t } = useLingui();
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );

  const createTab = () => {
    const tabId = createItem({
      type: NavigationMenuItemType.TAB,
      name: t`New tab`,
      icon: NAVIGATION_MENU_TAB_ICON_DEFAULT,
    });
    setCurrentNavigationMenuTabId(tabId);
    setNavigationMenuItemIdToRename(tabId);
  };

  const createSection = (containerId: string | null) => {
    const sectionId = createItem(
      { type: NavigationMenuItemType.SECTION, name: t`New section` },
      { targetFolderId: containerId },
    );
    setNavigationMenuItemIdToRename(sectionId);
  };

  const createBuiltInSection = ({
    containerId,
    type,
    name,
  }: {
    containerId: string | null;
    type: NavigationMenuItemType;
    name: string;
  }) => {
    createItem({ type, name }, { targetFolderId: containerId });
  };

  return { createTab, createSection, createBuiltInSection };
};
