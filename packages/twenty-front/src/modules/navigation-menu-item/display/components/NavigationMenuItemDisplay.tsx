import { NavigationMenuItemType } from 'twenty-shared/types';
import { NavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';
import { NavigationMenuItemLinkDisplay } from '@/navigation-menu-item/display/link/components/NavigationMenuItemLinkDisplay';
import { NavigationMenuItemObjectDisplay } from '@/navigation-menu-item/display/object/components/NavigationMenuItemObjectDisplay';
import { NavigationMenuItemPageLayoutDisplay } from '@/navigation-menu-item/display/page-layout/components/NavigationMenuItemPageLayoutDisplay';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';

type NavigationMenuItemDisplayProps = NavigationMenuItemSectionContentProps;

export const NavigationMenuItemDisplay = ({
  item,
  isEditInPlace,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  rightOptions,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
  readOnly,
  orphanIndex,
}: NavigationMenuItemDisplayProps) => {
  switch (item.type) {
    case NavigationMenuItemType.FOLDER:
      return (
        <NavigationMenuItemFolder
          item={item}
          isEditInPlace={isEditInPlace}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          readOnly={readOnly}
          orphanIndex={orphanIndex}
        />
      );
    case NavigationMenuItemType.LINK:
      return (
        <NavigationMenuItemLinkDisplay
          item={item}
          isEditInPlace={isEditInPlace}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
    case NavigationMenuItemType.PAGE_LAYOUT:
      return (
        <NavigationMenuItemPageLayoutDisplay
          item={item}
          isEditInPlace={isEditInPlace}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
    default:
      return (
        <NavigationMenuItemObjectDisplay
          item={item}
          isEditInPlace={isEditInPlace}
          editModeProps={editModeProps}
          isDragging={isDragging}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          rightOptions={rightOptions}
          onNavigationMenuItemClick={onNavigationMenuItemClick}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly={readOnly}
        />
      );
  }
};
