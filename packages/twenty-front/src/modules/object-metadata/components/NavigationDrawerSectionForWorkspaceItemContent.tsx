import { IconLink } from 'twenty-ui/display';

import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/utils/getEffectiveNavigationMenuItemColor';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';

export const WorkspaceSectionItemContent = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  objectMetadataItems,
  views,
}: WorkspaceSectionItemContentProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const type = item.itemType;

  if (type === 'folder') {
    return (
      <WorkspaceNavigationMenuItemsFolder
        folderId={item.id}
        folderName={item.name ?? 'Folder'}
        folderIconKey={item.Icon}
        folderColor={'color' in item ? (item.color ?? undefined) : undefined}
        navigationMenuItems={folderChildrenById.get(item.id) ?? []}
        isGroup={folderCount > 1}
        isSelectedInEditMode={editModeProps.isSelectedInEditMode}
        onEditModeClick={editModeProps.onEditModeClick}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        selectedNavigationMenuItemId={selectedNavigationMenuItemId}
        isDragging={isDragging}
      />
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
        Icon={IconLink}
        iconColor={getEffectiveNavigationMenuItemColor(linkItem) ?? undefined}
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
