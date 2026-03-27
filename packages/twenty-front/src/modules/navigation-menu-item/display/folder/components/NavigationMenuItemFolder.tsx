import { Suspense, lazy, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight, useIcons } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NavigationMenuItemFolderLayout } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderLayout';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const LazyNavigationMenuItemFolderDnd = lazy(() =>
  import(
    '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderDnd'
  ).then((module) => ({ default: module.NavigationMenuItemFolderDnd })),
);

type NavigationMenuItemFolderProps = Pick<
  NavigationMenuItemSectionContentProps,
  | 'item'
  | 'isEditInPlace'
  | 'editModeProps'
  | 'isDragging'
  | 'folderChildrenById'
  | 'folderCount'
  | 'onNavigationMenuItemClick'
  | 'readOnly'
  | 'orphanIndex'
>;

export const NavigationMenuItemFolder = ({
  item,
  isEditInPlace = false,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  onNavigationMenuItemClick,
  readOnly = false,
  orphanIndex,
}: NavigationMenuItemFolderProps) => {
  const folderId = item.id;
  const folderName = item.name ?? 'Folder';
  const folderIconKey = item.icon;
  const folderColor = 'color' in item ? (item.color as string | null) : null;
  const navigationMenuItems = folderChildrenById.get(folderId) ?? [];
  const isGroup = folderCount > 1;

  if (readOnly) {
    return (
      <NavigationMenuItemFolderReadOnlyContent
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <NavigationMenuItemFolderReadOnlyContent
          folderId={folderId}
          folderName={folderName}
          folderIconKey={folderIconKey}
          folderColor={folderColor}
          navigationMenuItems={navigationMenuItems}
          isGroup={isGroup}
        />
      }
    >
      <LazyNavigationMenuItemFolderDnd
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
        isEditInPlace={isEditInPlace}
        editModeProps={editModeProps}
        isDragging={isDragging}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        orphanIndex={orphanIndex}
      />
    </Suspense>
  );
};

type NavigationMenuItemFolderReadOnlyContentProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
};

const NavigationMenuItemFolderReadOnlyContent = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
}: NavigationMenuItemFolderReadOnlyContentProps) => {
  const { getIcon } = useIcons();
  const isMobile = useIsMobile();
  const { theme } = useContext(ThemeContext);
  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  return (
    <NavigationMenuItemFolderLayout
      header={
        <NavigationDrawerItem
          label={folderName}
          Icon={FolderIcon}
          iconColor={
            isDefined(folderColor)
              ? folderColor
              : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER
          }
          active={!isOpen && selectedNavigationMenuItemIndex >= 0}
          onClick={handleToggle}
          className="navigation-drawer-item"
          triggerEvent="CLICK"
          preventCollapseOnMobile={isMobile}
          alwaysShowRightOptions
          rightOptions={
            isOpen ? (
              <IconChevronDown
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.sm}
                color={themeCssVariables.font.color.tertiary}
              />
            ) : (
              <IconChevronRight
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.sm}
                color={themeCssVariables.font.color.tertiary}
              />
            )
          }
        />
      }
      isOpen={isOpen}
      isGroup={isGroup}
    >
      {navigationMenuItems.map((navigationMenuItem, index) => (
        <NavigationMenuItemFolderSubItem
          key={navigationMenuItem.id}
          navigationMenuItem={navigationMenuItem}
          index={index}
          arrayLength={navigationMenuItems.length}
          selectedNavigationMenuItemIndex={selectedNavigationMenuItemIndex}
          isDragging={false}
        />
      ))}
    </NavigationMenuItemFolderLayout>
  );
};
