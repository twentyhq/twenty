import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { WorkspaceFavorites } from '@/favorites/components/WorkspaceFavorites';
import { WorkspaceNavigationMenuItems } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItems';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const WorkspaceNavigationMenuItemsDispatcher = () => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  if (isNavigationMenuItemEditingEnabled) {
    return <WorkspaceNavigationMenuItems />;
  }

  return <WorkspaceFavorites />;
};
