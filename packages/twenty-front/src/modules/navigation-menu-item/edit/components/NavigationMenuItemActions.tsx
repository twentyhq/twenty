import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconChevronUp,
  IconChevronDown,
  IconHierarchy2,
  IconFolderSymlink,
  IconLayoutList,
  IconRowInsertTop,
  IconRowInsertBottom,
  IconTrash,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';

type NavigationMenuItemActionsProps = {
  item: NavigationMenuItem;
  section: NavigationMenuItemSection;
  onAdd: (target: NavigationMenuItemAddTarget) => void;
  onClose: () => void;
};
export const NavigationMenuItemActions = ({
  item,
  section,
  onAdd,
  onClose,
}: NavigationMenuItemActionsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const containerId =
    section === 'workspace'
      ? getNavigationMenuItemContainerId({
          item,
          items: workspaceNavigationMenuItems,
        })
      : null;
  const { items, getSortedSiblings, moveUp, moveDown, moveToFolder, remove } =
    useNavigationMenuItemMoveRemove(section, containerId);
  const { goToPage } = useDropdownPage();
  const siblings = getSortedSiblings(item.id) ?? [];
  const homeSections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId: null,
  });
  const tabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const sections =
    section === 'workspace'
      ? [
          ...homeSections,
          ...tabs.flatMap((tab) =>
            getNavigationMenuContainersInDisplayOrder({
              navigationMenuItems: workspaceNavigationMenuItems,
              type: NavigationMenuItemType.SECTION,
              containerId: tab.id,
            }),
          ),
        ].filter(
          (candidate) =>
            !isNavigationMenuItemBuiltInSection(candidate) &&
            candidate.id !== containerId,
        )
      : [];
  const getTabName = (tabId: string | null | undefined) =>
    tabs.find((tab) => tab.id === tabId)?.name ?? t`Home`;
  const moveToLabel = sections.length > 0 ? t`Move to` : t`Move to folder`;
  const index = siblings.findIndex((sibling) => sibling.id === item.id);
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
      onClick: () => run(() => moveUp(item.id)),
    },
    {
      id: 'down',
      label: t`Move down`,
      Icon: IconChevronDown,
      isDisabled: index < 0 || index === siblings.length - 1,
      onClick: () => run(() => moveDown(item.id)),
    },
    {
      id: 'folder',
      label: moveToLabel,
      Icon: IconFolderSymlink,
      isDisabled:
        item.type === NavigationMenuItemType.FOLDER && sections.length === 0,
      hasSubMenu: true,
      onClick: () => goToPage('folders'),
    },
    {
      id: 'before',
      label: t`Add menu item before`,
      Icon: IconRowInsertTop,
      hasSubMenu: true,
      onClick: () =>
        onAdd({ parentId: item.parentId ?? undefined, position: index }),
    },
    {
      id: 'after',
      label: t`Add menu item after`,
      Icon: IconRowInsertBottom,
      hasSubMenu: true,
      onClick: () =>
        onAdd({ parentId: item.parentId ?? undefined, position: index + 1 }),
    },
    {
      id: 'remove',
      label: t`Remove from sidebar`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () => run(() => remove(item.id)),
    },
  ];
  const folders: NavigationMenuItemOption[] = [
    {
      id: 'root',
      label: t`Root level`,
      Icon: IconHierarchy2,
      isDisabled: (item.parentId ?? null) === containerId,
      onClick: () => run(() => moveToFolder(item.id, containerId)),
    },
    ...items
      .filter(
        (folder) =>
          folder.type === NavigationMenuItemType.FOLDER &&
          item.type !== NavigationMenuItemType.FOLDER,
      )
      .map((folder) => ({
        id: folder.id,
        label: folder.name ?? t`Folder`,
        icon: (
          <ColoredIcon
            Icon={getIcon(folder.icon ?? FOLDER_ICON_DEFAULT)}
            color={folder.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
          />
        ),
        isDisabled: folder.id === item.parentId,
        onClick: () => run(() => moveToFolder(item.id, folder.id)),
      })),
    ...sections.map((targetSection) => ({
      id: targetSection.id,
      label: targetSection.name ?? t`Section`,
      contextualText: getTabName(targetSection.parentId),
      Icon: IconLayoutList,
      onClick: () => run(() => moveToFolder(item.id, targetSection.id)),
    })),
  ];
  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {actions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="folders">
        <Dropdown.Back>{moveToLabel}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {folders.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
