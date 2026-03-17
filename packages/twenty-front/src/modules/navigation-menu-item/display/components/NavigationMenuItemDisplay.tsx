import { NavigationMenuItemType } from 'twenty-shared/types';
import { NavigationMenuItemFolderDisplay } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderDisplay';
import { NavigationMenuItemLinkDisplay } from '@/navigation-menu-item/display/link/components/NavigationMenuItemLinkDisplay';
import { NavigationMenuItemObjectDisplay } from '@/navigation-menu-item/display/object/components/NavigationMenuItemObjectDisplay';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';

type NavigationMenuItemDisplayProps = NavigationMenuItemSectionContentProps;

export const NavigationMenuItemDisplay = ({
  item,
  section,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  rightOptions,
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
          section={section}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          readOnly={readOnly}
        />
      );
    case NavigationMenuItemType.LINK:
      return (
        <NavigationMenuItemLinkDisplay
          item={item}
          section={section}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
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
          section={section}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
          selectedNavigationMenuItemId={selectedNavigationMenuItemId}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
  }
};
