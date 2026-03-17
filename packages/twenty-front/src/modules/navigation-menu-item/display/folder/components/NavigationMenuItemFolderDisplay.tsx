import { lazy, Suspense } from 'react';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemFolderReadOnly } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderReadOnly';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';

const LazyNavigationMenuItemFolder = lazy(() =>
  import(
    '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder'
  ).then((m) => ({ default: m.NavigationMenuItemFolder })),
);

type NavigationMenuItemFolderDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemFolderDisplay = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  readOnly = false,
}: NavigationMenuItemFolderDisplayProps) => {
  const folderId = item.id;
  const folderName = item.name ?? 'Folder';
  const folderIconKey = item.icon;
  const folderColor = 'color' in item ? item.color : undefined;
  const navigationMenuItems = folderChildrenById.get(item.id) ?? [];
  const isGroup = folderCount > 1;

  if (readOnly) {
    return (
      <NavigationMenuItemFolderReadOnly
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
        <NavigationMenuItemFolderReadOnly
          folderId={folderId}
          folderName={folderName}
          folderIconKey={folderIconKey}
          folderColor={folderColor}
          navigationMenuItems={navigationMenuItems}
          isGroup={isGroup}
        />
      }
    >
      <LazyNavigationMenuItemFolder
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        section={NavigationSections.WORKSPACE}
        isGroup={isGroup}
        isSelectedInEditMode={editModeProps.isSelectedInEditMode}
        onEditModeClick={editModeProps.onEditModeClick}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        selectedNavigationMenuItemId={selectedNavigationMenuItemId}
        isDragging={isDragging}
      />
    </Suspense>
  );
};
