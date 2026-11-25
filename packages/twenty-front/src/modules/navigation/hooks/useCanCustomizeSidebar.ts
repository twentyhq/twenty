import { useLocation } from 'react-router-dom';
import { useIsMobile } from 'twenty-ui/utilities';

import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isCoreAgentPath } from '~/utils/isCoreAgentPath';

export const useCanCustomizeSidebar = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isNavigationMenuShown =
    useActiveNavigationDrawerTab() === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;

  return (
    isCustomizableSidebarEnabled &&
    !isMobile &&
    hasLayoutsPermission &&
    isNavigationMenuShown &&
    !isCoreAgentPath(pathname)
  );
};
