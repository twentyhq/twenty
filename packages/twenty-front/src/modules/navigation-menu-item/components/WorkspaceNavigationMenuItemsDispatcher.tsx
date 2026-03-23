import { PermissionFlagType } from '~/generated-metadata/graphql';

import { OmniaMemberWorkspaceNavigationMenuItems } from '@/navigation-menu-item/display/dnd/components/OmniaMemberWorkspaceNavigationMenuItems';
import { WorkspaceSection } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSection';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

export const WorkspaceNavigationMenuItemsDispatcher = () => {
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  if (hasLayoutsPermission) {
    return <WorkspaceSection />;
  }

  return <OmniaMemberWorkspaceNavigationMenuItems />;
};
