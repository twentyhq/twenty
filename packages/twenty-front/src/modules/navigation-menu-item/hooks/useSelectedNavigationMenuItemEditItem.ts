import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useSelectedNavigationMenuItemEditItem = () => {
  const selectedNavigationMenuItemInEditMode = useAtomValue(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const items = useWorkspaceSectionItems();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  return { selectedItem };
};
