import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useDraftNavigationMenuItems = () => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValueV2(
    navigationMenuItemsDraftStateV2,
  );

  const currentDraft = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;

  return { currentDraft };
};
