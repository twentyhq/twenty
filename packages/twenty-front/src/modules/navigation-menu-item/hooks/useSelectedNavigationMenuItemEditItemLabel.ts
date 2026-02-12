import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { useSelectedNavigationMenuItemEditItemObjectMetadata } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItemObjectMetadata';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';

export const useSelectedNavigationMenuItemEditItemLabel = () => {
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const { selectedItemObjectMetadata } =
    useSelectedNavigationMenuItemEditItemObjectMetadata();

  const selectedItemLabel = selectedItem
    ? selectedItem.itemType === NavigationMenuItemType.FOLDER
      ? (selectedItem.name ?? 'Folder')
      : selectedItem.itemType === NavigationMenuItemType.LINK
        ? (selectedItem.name ?? 'Link')
        : (selectedItemObjectMetadata?.labelPlural ?? '')
    : null;

  return { selectedItemLabel };
};
