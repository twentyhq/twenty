import { useRecoilValue } from 'recoil';

import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';

export const useDraftNavigationMenuItems = () => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );

  const currentDraft = navigationMenuItemsDraft ?? workspaceNavigationMenuItems;

  return { currentDraft };
};
