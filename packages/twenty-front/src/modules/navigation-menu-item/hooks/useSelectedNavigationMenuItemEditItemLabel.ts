import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';

const getLabelForItemType = (
  itemType: NavigationMenuItemType,
  item: { name?: string | null; labelIdentifier?: string | null },
  objectLabelSingular?: string | null,
): string => {
  switch (itemType) {
    case NavigationMenuItemType.FOLDER:
      return item.name ?? 'Folder';
    case NavigationMenuItemType.LINK:
      return item.name ?? 'Link';
    case NavigationMenuItemType.VIEW:
      return item.labelIdentifier ?? objectLabelSingular ?? '';
    default:
      return objectLabelSingular ?? '';
  }
};

export const useSelectedNavigationMenuItemEditItemLabel = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();

  const selectedItemLabel = selectedItem
    ? getLabelForItemType(
        selectedItem.itemType,
        selectedItem,
        selectedItemObjectMetadata?.labelSingular,
      )
    : null;

  return { selectedItemLabel };
};
