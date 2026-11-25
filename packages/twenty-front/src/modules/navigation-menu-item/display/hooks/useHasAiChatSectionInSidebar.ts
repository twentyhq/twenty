import { isBuiltInSectionKey } from 'twenty-shared/utils';

import { AI_CHAT_BUILT_IN_SECTION_KEYS } from '@/navigation-menu-item/common/constants/AiChatBuiltInSectionKeys';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useHasAiChatSectionInSidebar = () => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();

  return (
    isCustomizableSidebarEnabled &&
    workspaceNavigationMenuItems.some(
      ({ builtInSectionKey }) =>
        isBuiltInSectionKey(builtInSectionKey) &&
        AI_CHAT_BUILT_IN_SECTION_KEYS.includes(builtInSectionKey) &&
        isBuiltInSectionAvailable(builtInSectionKey),
    )
  );
};
