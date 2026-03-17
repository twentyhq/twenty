import { lazy, Suspense } from 'react';

import { NavigationMenuItemFolderReadOnly } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderReadOnly';
import type { WorkspaceSectionItemContentProps } from '@/navigation-menu-item/display/sections/types/WorkspaceSectionItemContentProps';

const LazyWorkspaceNavigationMenuItemsFolder = lazy(() =>
  import(
    '@/navigation-menu-item/display/folder/components/WorkspaceNavigationMenuItemsFolder'
  ).then((m) => ({ default: m.WorkspaceNavigationMenuItemsFolder })),
);

type NavigationMenuItemFolderDisplayProps = WorkspaceSectionItemContentProps;

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
      <LazyWorkspaceNavigationMenuItemsFolder
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
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
