import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useSetAdvancedMode } from '@/navigation/hooks/useSetAdvancedMode';
import { DeveloperModeSwitch } from '@/navigation/components/DeveloperModeSwitch';
import { MOBILE_NAVIGATION_BAR_CLEARANCE } from '@/navigation/constants/MobileNavigationBarClearance';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { AdvancedSettingsSwitch } from '@/ui/input/components/AdvancedSettingsSwitch';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledAdvancedSwitchFixedContent = styled.div<{ isMobile: boolean }>`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
  margin-top: auto;
  padding-bottom: ${({ isMobile }) =>
    isMobile ? MOBILE_NAVIGATION_BAR_CLEARANCE : '0'};
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const advancedSettingsSwitchClassName = css`
  padding-right: 0;
`;

export const SettingsNavigationDrawerContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const { setAdvancedMode } = useSetAdvancedMode();
  const isLogsSettingsSectionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED,
  );

  return (
    <>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <StyledAdvancedSwitchFixedContent isMobile={isMobile}>
        <NavigationDrawerSection>
          {isLogsSettingsSectionEnabled ? (
            <DeveloperModeSwitch
              isEnabled={isAdvancedModeEnabled}
              onEnabledChange={setAdvancedMode}
              isCompact={!isNavigationDrawerExpanded}
            />
          ) : (
            <AdvancedSettingsSwitch
              className={advancedSettingsSwitchClassName}
              isAdvancedModeEnabled={isAdvancedModeEnabled}
              setIsAdvancedModeEnabled={setAdvancedMode}
              label={t`Advanced`}
              isCompact={!isNavigationDrawerExpanded}
            />
          )}
        </NavigationDrawerSection>
      </StyledAdvancedSwitchFixedContent>
    </>
  );
};
