import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSelectedNavigationMenuItemEditItem = () => {
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const items = useNavigationMenuItemSectionItems();

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemIdInEditMode)
    : undefined;

  return { selectedItem };
};
