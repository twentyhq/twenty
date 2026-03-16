import { PermissionFlagType } from '~/generated-metadata/graphql';

import { OmniaMemberWorkspaceNavigationMenuItems } from '@/navigation-menu-item/components/OmniaMemberWorkspaceNavigationMenuItems';
import { WorkspaceNavigationMenuItems } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

export const WorkspaceNavigationMenuItemsDispatcher = () => {
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  if (hasLayoutsPermission) {
    return <WorkspaceNavigationMenuItems />;
  }

  return <OmniaMemberWorkspaceNavigationMenuItems />;
};
