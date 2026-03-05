import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationDrawerSectionForWorkspaceItemFolderContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemFolderContent';
import { NavigationDrawerSectionForWorkspaceItemLinkContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemLinkContent';
import { NavigationDrawerSectionForWorkspaceItemObjectContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemObjectContent';
import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/WorkspaceSectionItemContentProps';

type NavigationDrawerSectionForWorkspaceItemContentProps =
  WorkspaceSectionItemContentProps;

export const NavigationDrawerSectionForWorkspaceItemContent = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  readOnly,
}: NavigationDrawerSectionForWorkspaceItemContentProps) => {
  switch (item.itemType) {
    case NavigationMenuItemType.FOLDER:
      return (
        <NavigationDrawerSectionForWorkspaceItemFolderContent
          item={item}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          readOnly={readOnly}
        />
      );
    case NavigationMenuItemType.LINK:
      return (
        <NavigationDrawerSectionForWorkspaceItemLinkContent
          item={item}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
    default:
      return (
        <NavigationDrawerSectionForWorkspaceItemObjectContent
          item={item}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
  }
};
