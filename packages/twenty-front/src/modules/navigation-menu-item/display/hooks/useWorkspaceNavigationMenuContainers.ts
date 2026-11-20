import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { isNavigationMenuTabAiOnly } from '@/navigation-menu-item/common/utils/isNavigationMenuTabAiOnly';
import { useAreAiChatSectionsAvailable } from '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useWorkspaceNavigationMenuContainers = ({
  type,
  containerId,
}: {
  type: NavigationMenuItemType.TAB | NavigationMenuItemType.SECTION;
  containerId: string | null;
}) => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const areAiChatSectionsAvailable = useAreAiChatSectionsAvailable();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (!isCustomizableSidebarEnabled) {
    return [];
  }

  const containers = getNavigationMenuContainersInDisplayOrder({
    navigationMenuItems: workspaceNavigationMenuItems,
    type,
    containerId,
  });

  const shouldHideAiOnlyTabs =
    type === NavigationMenuItemType.TAB &&
    !areAiChatSectionsAvailable &&
    !isLayoutCustomizationModeEnabled;

  if (!shouldHideAiOnlyTabs) {
    return containers;
  }

  return containers.filter(
    (tab) =>
      !isNavigationMenuTabAiOnly({
        tabId: tab.id,
        navigationMenuItems: workspaceNavigationMenuItems,
      }),
  );
};
