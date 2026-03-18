import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSelectedNavigationMenuItemEditItem = () => {
  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useNavigationMenuItemSectionItems();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  return { selectedItem };
};
