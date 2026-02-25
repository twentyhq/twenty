import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

export const useSelectedNavigationMenuItemEditItemObjectMetadata = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
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
