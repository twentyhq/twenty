import { useLocation } from 'react-router-dom';
import { useIsMobile } from 'twenty-ui/utilities';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isAiModePath } from '~/utils/isAiModePath';

export const useCanCustomizeSidebar = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const isNavigationMenuShown =
    useActiveNavigationDrawerTab() === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU;

  return (
    isCustomizableSidebarEnabled &&
    !isMobile &&
    hasLayoutsPermission &&
    isNavigationMenuShown &&
    (isLayoutCustomizationAllowedOnCurrentPage || isAiModePath(pathname))
  );
};
