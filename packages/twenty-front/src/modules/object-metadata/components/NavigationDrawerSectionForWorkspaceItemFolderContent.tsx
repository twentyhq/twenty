import { lazy, Suspense } from 'react';

import { WorkspaceFolderReadOnly } from '@/object-metadata/components/WorkspaceFolderReadOnly';
import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/WorkspaceSectionItemContentProps';

const LazyWorkspaceNavigationMenuItemsFolder = lazy(() =>
  import(
    '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder'
  ).then((m) => ({ default: m.WorkspaceNavigationMenuItemsFolder })),
);

type NavigationDrawerSectionForWorkspaceItemFolderContentProps =
  WorkspaceSectionItemContentProps;

export const NavigationDrawerSectionForWorkspaceItemFolderContent = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  readOnly = false,
}: NavigationDrawerSectionForWorkspaceItemFolderContentProps) => {
  const folderId = item.id;
  const folderName = item.name ?? 'Folder';
  const folderIconKey = item.Icon;
  const folderColor = 'color' in item ? item.color : undefined;
  const navigationMenuItems = folderChildrenById.get(item.id) ?? [];
  const isGroup = folderCount > 1;

  if (readOnly) {
    return (
      <WorkspaceFolderReadOnly
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
        <WorkspaceFolderReadOnly
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
