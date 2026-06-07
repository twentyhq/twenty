import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSelectedNavigationMenuItemEditItem = () => {
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const items = useNavigationMenuItemEditSectionItems();

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemIdInEditMode)
    : undefined;

  return { selectedItem };
};
