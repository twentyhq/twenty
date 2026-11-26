import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
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
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { type NavigationMenuItemMoveDestination } from '@/navigation-menu-item/common/types/NavigationMenuItemMoveDestination';
import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';
import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';
import { getNavigationMenuItemMoveDestinationGroups } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMoveDestinationGroups';
import { useGetNavigationMenuTabLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabLabel';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type NavigationMenuItemMoveOptionGroup = {
  id: string;
  label?: string;
  options: NavigationMenuItemOption[];
};

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
  const getNavigationMenuTabLabel = useGetNavigationMenuTabLabel();
  const { getIcon } = useIcons();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
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
  const tabs = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.TAB,
    containerId: null,
  });
  const isFolder = item.type === NavigationMenuItemType.FOLDER;
  const parentType = workspaceNavigationMenuItems.find(
    (candidate) => candidate.id === item.parentId,
  )?.type;
  const isAtContainerTopLevel =
    section === 'workspace' &&
    isCustomizableSidebarEnabled &&
    (!isDefined(item.parentId) || parentType === NavigationMenuItemType.TAB);
  const isMovingAcrossTabs =
    section === 'workspace' && isCustomizableSidebarEnabled;
  const getTabName = (tabId: string | null) => {
    const tab = tabs.find(({ id }) => id === tabId);

    return isDefined(tab) ? getNavigationMenuTabLabel(tab) : t`Home`;
  };
  const moveToLabel = isMovingAcrossTabs ? t`Move to` : t`Move to folder`;
  const index = siblings.findIndex((sibling) => sibling.id === item.id);
  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };
  const getFolderIcon = (folder: NavigationMenuItem) => (
    <ColoredIcon
      Icon={getIcon(folder.icon ?? FOLDER_ICON_DEFAULT)}
      color={folder.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
    />
  );
  const toMoveOption = (
    destination: NavigationMenuItemMoveDestination,
  ): NavigationMenuItemOption => {
    const moveOption = {
      id: destination.containerId ?? 'home',
      isDisabled: (item.parentId ?? null) === destination.containerId,
      onClick: () => run(() => moveToFolder(item.id, destination.containerId)),
    };

    switch (destination.kind) {
      case 'root':
        return { ...moveOption, label: t`Root level`, Icon: IconHierarchy2 };
      case 'section':
        return {
          ...moveOption,
          label: destination.item.name ?? t`Section`,
          Icon: IconLayoutList,
        };
      case 'folder':
        return {
          ...moveOption,
          label: destination.item.name ?? t`Folder`,
          icon: getFolderIcon(destination.item),
        };
    }
  };
  const getCrossTabMoveOptionGroups = (): NavigationMenuItemMoveOptionGroup[] =>
    getNavigationMenuItemMoveDestinationGroups({
      items: workspaceNavigationMenuItems,
      tabIds: tabs.map((tab) => tab.id),
      canMoveIntoFolder: !isFolder,
    }).map((group) => ({
      id: group.tabId ?? 'home',
      label: getTabName(group.tabId),
      options: group.destinations.map(toMoveOption),
    }));
  const getContainerMoveOptions = (): NavigationMenuItemOption[] => [
    {
      id: 'root',
      label: t`Root level`,
      Icon: IconHierarchy2,
      isDisabled: (item.parentId ?? null) === containerId,
      onClick: () => run(() => moveToFolder(item.id, containerId)),
    },
    ...items
      .filter(
        (folder) => folder.type === NavigationMenuItemType.FOLDER && !isFolder,
      )
      .map((folder) => ({
        id: folder.id,
        label: folder.name ?? t`Folder`,
        icon: getFolderIcon(folder),
        isDisabled: folder.id === item.parentId,
        onClick: () => run(() => moveToFolder(item.id, folder.id)),
      })),
  ];
  const moveOptionGroups: NavigationMenuItemMoveOptionGroup[] =
    isMovingAcrossTabs
      ? getCrossTabMoveOptionGroups()
      : [{ id: 'container', options: getContainerMoveOptions() }];
  const moveOptions = moveOptionGroups.flatMap((group) => group.options);
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
        (isFolder && !isMovingAcrossTabs) ||
        moveOptions.every((option) => option.isDisabled),
      hasSubMenu: true,
      onClick: () => goToPage('folders'),
    },
    {
      id: 'before',
      label: t`Add item before`,
      Icon: IconRowInsertTop,
      hasSubMenu: true,
      onClick: () =>
        onAdd({ parentId: item.parentId ?? undefined, position: index }),
    },
    {
      id: 'after',
      label: t`Add item after`,
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
  const addItemActionIds = ['before', 'after'];
  const visibleActions = isAtContainerTopLevel
    ? actions.filter((option) => !addItemActionIds.includes(option.id))
    : actions;

  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {visibleActions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="folders">
        <Dropdown.Back>{moveToLabel}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {moveOptionGroups.map((group) => (
            <Dropdown.Section key={group.id} label={group.label}>
              {group.options.map((option) => (
                <NavigationMenuItemSelectableItem
                  key={option.id}
                  item={option}
                />
              ))}
            </Dropdown.Section>
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
