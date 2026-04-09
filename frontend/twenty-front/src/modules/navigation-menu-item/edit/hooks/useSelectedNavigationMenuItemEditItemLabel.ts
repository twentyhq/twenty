import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/edit/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const getLabelForItem = (
  item: NavigationMenuItem,
  objectMetadataItems: Parameters<typeof getNavigationMenuItemLabel>[1],
  views: Parameters<typeof getNavigationMenuItemLabel>[2],
  objectLabelSingular?: string | null,
): string => {
  switch (item.type) {
    case NavigationMenuItemType.FOLDER:
      return item.name ?? 'Folder';
    case NavigationMenuItemType.LINK:
      return item.name ?? 'Link';
    case NavigationMenuItemType.OBJECT:
    case NavigationMenuItemType.VIEW:
      return (
        getNavigationMenuItemLabel(item, objectMetadataItems, views) ||
        objectLabelSingular ||
        ''
      );
    default:
      return objectLabelSingular ?? '';
  }
};

export const useSelectedNavigationMenuItemEditItemLabel = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const selectedItemLabel = selectedItem
    ? getLabelForItem(
        selectedItem,
        objectMetadataItems,
        views,
        selectedItemObjectMetadata?.labelSingular,
      )
    : null;

  return { selectedItemLabel };
};
