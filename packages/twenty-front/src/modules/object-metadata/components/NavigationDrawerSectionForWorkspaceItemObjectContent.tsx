import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import type { WorkspaceSectionItemContentProps } from '@/object-metadata/components/WorkspaceSectionItemContentProps';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsSelector } from '@/views/states/selectors/coreViewsSelector';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type NavigationDrawerSectionForWorkspaceItemObjectContentProps =
  WorkspaceSectionItemContentProps;

export const NavigationDrawerSectionForWorkspaceItemObjectContent = ({
  item,
  editModeProps,
  isDragging,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemObjectContentProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const coreViews = useAtomStateValue(coreViewsSelector);
  const views = coreViews.map(convertCoreViewToView);
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
