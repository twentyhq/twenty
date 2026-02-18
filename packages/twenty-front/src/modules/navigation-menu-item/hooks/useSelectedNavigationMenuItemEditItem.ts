import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useSelectedNavigationMenuItemEditItem = () => {
  const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const items = useWorkspaceSectionItems();

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  return { selectedItem };
};
