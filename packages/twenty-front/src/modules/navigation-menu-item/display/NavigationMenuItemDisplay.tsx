import { NavigationMenuItemType } from 'twenty-shared/types';
import { NavigationMenuItemFolderDisplay } from '@/navigation-menu-item/display/folder/NavigationMenuItemFolderDisplay';
import { NavigationMenuItemLinkDisplay } from '@/navigation-menu-item/display/link/NavigationMenuItemLinkDisplay';
import { NavigationMenuItemObjectDisplay } from '@/navigation-menu-item/display/object/NavigationMenuItemObjectDisplay';
import type { WorkspaceSectionItemContentProps } from '@/navigation-menu-item/display/sections/WorkspaceSectionItemContentProps';

type NavigationMenuItemDisplayProps = WorkspaceSectionItemContentProps;

export const NavigationMenuItemDisplay = ({
  item,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  readOnly,
}: NavigationMenuItemDisplayProps) => {
  switch (item.type) {
    case NavigationMenuItemType.FOLDER:
      return (
        <NavigationMenuItemFolderDisplay
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
        <NavigationMenuItemLinkDisplay
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
        <NavigationMenuItemObjectDisplay
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
