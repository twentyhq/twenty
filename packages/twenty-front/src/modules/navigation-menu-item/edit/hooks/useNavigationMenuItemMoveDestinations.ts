import { useLingui } from '@lingui/react/macro';
import {
  IconHierarchy2,
  type IconComponent,
  IconLayoutList,
  useIcons,
} from 'twenty-ui/icon';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export type NavigationMenuItemMoveDestination = {
  id: string | null;
  label: string;
  Icon: IconComponent;
  iconColor?: string;
  isDisabled: boolean;
};

export type NavigationMenuItemMoveDestinationGroup = {
  id: string;
  label?: string;
  destinations: NavigationMenuItemMoveDestination[];
};

const sortByPosition = (items: NavigationMenuItem[]) =>
  [...items].sort((a, b) => a.position - b.position);

export const useNavigationMenuItemMoveDestinations = ({
  item,
  section,
}: {
  item: NavigationMenuItem;
  section: NavigationMenuItemSection;
}): NavigationMenuItemMoveDestinationGroup[] => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const items =
    section === 'workspace'
      ? workspaceNavigationMenuItems
      : navigationMenuItems;
  const currentParentId = item.folderId ?? null;
  const excludedIds = new Set([
    item.id,
    ...getNavigationMenuItemDescendantIds(items, item.id),
  ]);

  const getFolderDestination = (
    folder: NavigationMenuItem,
  ): NavigationMenuItemMoveDestination => ({
    id: folder.id,
    label: folder.name ?? t`Folder`,
    Icon: getIcon(folder.icon ?? FOLDER_ICON_DEFAULT),
    iconColor: folder.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
    isDisabled: folder.id === currentParentId,
  });

  const getRootDestination = (
    containerId: string | null,
  ): NavigationMenuItemMoveDestination => ({
    id: containerId,
    label: t`Root level`,
    Icon: IconHierarchy2,
    isDisabled: containerId === currentParentId,
  });

  const canMoveIntoSection = !isNavigationMenuItemSection(item);
  const canMoveIntoFolder =
    canMoveIntoSection && !isNavigationMenuItemFolder(item);

  if (section === 'favorite') {
    return [
      {
        id: 'favorites',
        destinations: [
          getRootDestination(null),
          ...(canMoveIntoFolder
            ? sortByPosition(
                items.filter(
                  (folder) =>
                    isNavigationMenuItemFolder(folder) &&
                    !excludedIds.has(folder.id),
                ),
              ).map(getFolderDestination)
            : []),
        ],
      },
    ];
  }

  const getContainerDestinations = (
    containerId: string | null,
  ): NavigationMenuItemMoveDestination[] => {
    const getFolders = (parentId: string | null) =>
      canMoveIntoFolder
        ? sortByPosition(
            items.filter(
              (folder) =>
                isNavigationMenuItemFolder(folder) &&
                (folder.folderId ?? null) === parentId &&
                !excludedIds.has(folder.id),
            ),
          ).map(getFolderDestination)
        : [];

    const sections = canMoveIntoSection
      ? sortByPosition(
          items.filter(
            (sectionItem) =>
              isNavigationMenuItemSection(sectionItem) &&
              (sectionItem.folderId ?? null) === containerId,
          ),
        )
      : [];

    return [
      getRootDestination(containerId),
      ...getFolders(containerId),
      ...sections.flatMap((sectionItem) => [
        {
          id: sectionItem.id,
          label: sectionItem.name ?? t`Section`,
          Icon: IconLayoutList,
          isDisabled: sectionItem.id === currentParentId,
        },
        ...getFolders(sectionItem.id),
      ]),
    ];
  };

  const tabs = sortByPosition(items.filter(isNavigationMenuItemTab));

  return [
    {
      id: 'home',
      label: t`Home`,
      destinations: getContainerDestinations(null),
    },
    ...tabs.map((tab) => ({
      id: tab.id,
      label: tab.name ?? t`Tab`,
      destinations: getContainerDestinations(tab.id).map((destination) =>
        destination.id === tab.id
          ? {
              ...destination,
              Icon: getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT),
            }
          : destination,
      ),
    })),
  ];
};
