import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useDraftNavigationMenuItems = () => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const currentDraft = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;

  return { currentDraft };
};
