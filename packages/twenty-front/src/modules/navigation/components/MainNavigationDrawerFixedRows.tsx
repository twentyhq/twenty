import { NavigationMenuItemPinnedCommands } from '@/navigation-menu-item/display/command/components/NavigationMenuItemPinnedCommands';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const MainNavigationDrawerFixedRows = () => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  return <NavigationMenuItemPinnedCommands />;
};
