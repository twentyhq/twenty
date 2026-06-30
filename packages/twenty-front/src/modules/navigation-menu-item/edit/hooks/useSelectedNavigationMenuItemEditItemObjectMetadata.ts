import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useSelectedNavigationMenuItemEditItemObjectMetadata = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const views = useAtomStateValue(viewsSelector);
  const { objectMetadataItems } = useObjectMetadataItems();

  const selectedItemObjectMetadata = selectedItem
    ? getObjectMetadataForNavigationMenuItem(
        selectedItem,
        objectMetadataItems,
        views,
      )
    : null;

  return { selectedItemObjectMetadata };
};
