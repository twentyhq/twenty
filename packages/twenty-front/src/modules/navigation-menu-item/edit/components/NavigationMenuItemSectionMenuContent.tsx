import { useLingui } from '@lingui/react/macro';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import {
  IconChevronDown,
  IconChevronUp,
  IconFolderSymlink,
  IconHome,
  IconTrash,
  useIcons,
} from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

type NavigationMenuItemSectionMenuContentProps = {
  section: NavigationMenuItem;
  onClose: () => void;
};

export const NavigationMenuItemSectionMenuContent = ({
  section,
  onClose,
}: NavigationMenuItemSectionMenuContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { goToPage } = useDropdownPage();
  const tabs = useWorkspaceNavigationMenuTabs();
  const { getSortedSiblings, moveUp, moveDown, moveToFolder, remove } =
    useNavigationMenuItemMoveRemove('workspace');
  const siblings = getSortedSiblings(section.id) ?? [];
  const index = siblings.findIndex((sibling) => sibling.id === section.id);
  const parentId = section.folderId ?? null;

  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };

  const actions: NavigationMenuItemOption[] = [
    {
      id: 'up',
      label: t`Move up`,
      Icon: IconChevronUp,
      isDisabled: index <= 0,
      onClick: () => run(() => moveUp(section.id)),
    },
    {
      id: 'down',
      label: t`Move down`,
      Icon: IconChevronDown,
      isDisabled: index < 0 || index === siblings.length - 1,
      onClick: () => run(() => moveDown(section.id)),
    },
    {
      id: 'move',
      label: t`Move to tab`,
      Icon: IconFolderSymlink,
      isDisabled: tabs.length === 0,
      hasSubMenu: true,
      onClick: () => goToPage('move'),
    },
    {
      id: 'remove',
      label: t`Remove section`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () => run(() => remove(section.id)),
    },
  ];

  const destinations: NavigationMenuItemOption[] = [
    {
      id: 'home',
      label: t`Home`,
      Icon: IconHome,
      isDisabled: parentId === null,
      onClick: () => run(() => moveToFolder(section.id, null)),
    },
    ...tabs.map((tab) => ({
      id: tab.id,
      label: tab.name ?? t`Tab`,
      Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
      isDisabled: parentId === tab.id,
      onClick: () => run(() => moveToFolder(section.id, tab.id)),
    })),
  ];

  return (
    <>
      <Dropdown.Page id="root">
        <NavigationMenuItemContainerNameEditor
          item={section}
          placeholder={t`Section name`}
        />
        <Dropdown.Separator />
        <Dropdown.Section>
          {actions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="move">
        <Dropdown.Back>{t`Move to tab`}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {destinations.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
