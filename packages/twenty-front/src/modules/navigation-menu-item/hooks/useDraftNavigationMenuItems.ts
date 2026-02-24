import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useDraftNavigationMenuItems = () => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useAtomValue(
    navigationMenuItemsDraftStateV2,
  );

  const currentDraft = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;

  return { currentDraft };
};
