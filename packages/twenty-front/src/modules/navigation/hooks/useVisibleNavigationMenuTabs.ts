import { PermissionFlagType } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { hasNavigationMenuTabOnlyAiSections } from '@/navigation-menu-item/common/utils/hasNavigationMenuTabOnlyAiSections';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useWorkspaceNavigationMenuTabs } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuTabs';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useVisibleNavigationMenuTabs = () => {
  const navigationMenuTabs = useWorkspaceNavigationMenuTabs();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return navigationMenuTabs.filter(
    (tab) =>
      hasAiPermission ||
      isLayoutCustomizationModeEnabled ||
      !hasNavigationMenuTabOnlyAiSections({
        items: workspaceNavigationMenuItems,
        tabId: tab.id,
      }),
  );
};
