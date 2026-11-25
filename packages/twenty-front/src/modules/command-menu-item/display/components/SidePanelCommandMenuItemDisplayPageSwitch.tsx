import { LegacySidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/LegacySidePanelCommandMenuItemDisplayPage';
import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelCommandMenuItemDisplayPageSwitch = () => {
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  return isCustomizableSidebarEnabled ? (
    <SidePanelCommandMenuItemDisplayPage />
  ) : (
    <LegacySidePanelCommandMenuItemDisplayPage />
  );
};
