import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { NavigationDrawerItemForObjectMetadataItem } from '@/navigation-menu-item/display/object/components/NavigationDrawerItemForObjectMetadataItem';
import type { WorkspaceSectionItemContentProps } from '@/navigation-menu-item/display/sections/types/WorkspaceSectionItemContentProps';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type NavigationMenuItemObjectDisplayProps = WorkspaceSectionItemContentProps;

export const NavigationMenuItemObjectDisplay = ({
  item,
  editModeProps,
  isDragging,
  onActiveObjectMetadataItemClick,
}: NavigationMenuItemObjectDisplayProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
    item,
    objectMetadataItems,
    views,
  );
  if (!objectMetadataItem) {
    return null;
  }
  return (
    <NavigationDrawerItemForObjectMetadataItem
      objectMetadataItem={objectMetadataItem}
      navigationMenuItem={item}
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
