import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconTrash } from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useNavigationMenuItemReorderOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemReorderOptions';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type NavigationMenuTabMenuContentProps = {
  tab: NavigationMenuItem;
  onClose: () => void;
};

export const NavigationMenuTabMenuContent = ({
  tab,
  onClose,
}: NavigationMenuTabMenuContentProps) => {
  const { t } = useLingui();
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const { remove } = useNavigationMenuItemMoveRemove('workspace');
  const { reorderOptions } = useNavigationMenuItemReorderOptions({
    navigationMenuItemId: tab.id,
    section: 'workspace',
    isHorizontal: true,
    onClose,
  });

  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };

  const actions: NavigationMenuItemOption[] = [
    ...reorderOptions,
    {
      id: 'delete',
      label: t`Delete tab`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () =>
        run(async () => {
          setCurrentNavigationMenuTabId(null);
          setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
          await remove(tab.id);
        }),
    },
  ];

  return (
    <>
      <NavigationMenuItemContainerNameEditor
        item={tab}
        placeholder={t`Tab name`}
        hasIconPicker
        onSubmit={onClose}
      />
      <Dropdown.Separator />
      <Dropdown.Section>
        {actions.map((option) => (
          <NavigationMenuItemSelectableItem key={option.id} item={option} />
        ))}
      </Dropdown.Section>
    </>
  );
};
