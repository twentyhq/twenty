import { useLocation } from 'react-router-dom';
import { useIsMobile } from 'twenty-ui/utilities';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useActiveNavigationDrawerTab } from '@/navigation/hooks/useActiveNavigationDrawerTab';
import { isSidebarCustomizationAllowedOnPage } from '@/navigation/utils/isSidebarCustomizationAllowedOnPage';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useCanCustomizeSidebar = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const activeNavigationDrawerTab = useActiveNavigationDrawerTab();

  return (
    isCustomizableSidebarEnabled &&
    !isMobile &&
    hasLayoutsPermission &&
    isSidebarCustomizationAllowedOnPage({
      pathname,
      activeNavigationDrawerTab,
      isLayoutCustomizationAllowedOnCurrentPage,
    })
  );
};
