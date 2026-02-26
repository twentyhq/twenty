import { IconLink } from 'twenty-ui/display';

import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';

export const WorkspaceSectionItemContent = ({
  item,
  editModeProps,
  useDndKit,
  theme,
  isEditMode,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  objectMetadataItems,
  views,
}: WorkspaceSectionItemContentProps) => {
  const type = item.itemType;

  if (type === 'folder') {
    return (
      <WorkspaceNavigationMenuItemsFolder
        folderId={item.id}
        folderName={item.name ?? 'Folder'}
        folderIconKey={item.Icon}
        navigationMenuItems={folderChildrenById.get(item.id) ?? []}
        isGroup={folderCount > 1}
        isEditMode={isEditMode}
        isSelectedInEditMode={editModeProps.isSelectedInEditMode}
        onEditModeClick={editModeProps.onEditModeClick}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        selectedNavigationMenuItemId={selectedNavigationMenuItemId}
        isDragging={isDragging}
        useDndKit={useDndKit}
      />
    );
  }

  if (type === 'link') {
    const linkItem = item as ProcessedNavigationMenuItem;
    const iconColors = getNavigationMenuItemIconColors(theme).link;
    return (
      <NavigationDrawerItem
        label={linkItem.labelIdentifier}
        to={isEditMode || isDragging ? undefined : linkItem.link}
        onClick={isEditMode ? editModeProps.onEditModeClick : undefined}
        Icon={IconLink}
        iconBackgroundColor={iconColors}
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
      isEditMode={isEditMode}
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
