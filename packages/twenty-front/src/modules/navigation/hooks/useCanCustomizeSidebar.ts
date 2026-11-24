import { useIsMobile } from 'twenty-ui/utilities';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useCanCustomizeSidebar = () => {
  const isMobile = useIsMobile();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();

  return (
    isCustomizableSidebarEnabled &&
    !isMobile &&
    hasLayoutsPermission &&
    isLayoutCustomizationAllowedOnCurrentPage
  );
};
