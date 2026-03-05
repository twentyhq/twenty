import { lazy, Suspense } from 'react';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { WorkspaceFolderReadOnly } from '@/object-metadata/components/WorkspaceFolderReadOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

const LazyWorkspaceNavigationMenuItemsFolder = lazy(() =>
  import(
    '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder'
  ).then((m) => ({ default: m.WorkspaceNavigationMenuItemsFolder })),
);

import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/WorkspaceSectionItemContentProps';

export const WorkspaceSectionItemContent = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  readOnly = false,
}: WorkspaceSectionItemContentProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
  const type = item.itemType;

  if (type === 'folder') {
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
  }

  if (type === 'link') {
    const linkItem = item as ProcessedNavigationMenuItem;
    return (
      <NavigationDrawerItem
        label={linkItem.labelIdentifier}
        to={
          isNavigationMenuInEditMode || isDragging ? undefined : linkItem.link
        }
        onClick={
          isNavigationMenuInEditMode ? editModeProps.onEditModeClick : undefined
        }
        Icon={() => <NavigationMenuItemIcon navigationMenuItem={linkItem} />}
        active={false}
        isSelectedInEditMode={editModeProps.isSelectedInEditMode}
        isDragging={isDragging}
        triggerEvent="CLICK"
      />
    );
  }

  const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
    item as ProcessedNavigationMenuItem,
    objectMetadataItems,
    views,
  );
  if (!objectMetadataItem) {
    return null;
  }

  return (
    <NavigationDrawerItemForObjectMetadataItem
      objectMetadataItem={objectMetadataItem}
      navigationMenuItem={item as ProcessedNavigationMenuItem}
      isSelectedInEditMode={editModeProps.isSelectedInEditMode}
      onEditModeClick={editModeProps.onEditModeClick}
      isDragging={isDragging}
      onActiveItemClickWhenNotInEditMode={
        onActiveObjectMetadataItemClick
          ? () => onActiveObjectMetadataItemClick(objectMetadataItem, item.id)
          : undefined
      }
    />
  );
};
