import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { MOBILE_NAVIGATION_BAR_CLEARANCE } from '@/navigation/constants/MobileNavigationBarClearance';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { AdvancedSettingsSwitch } from '@/ui/input/components/AdvancedSettingsSwitch';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledAdvancedSwitchFixedContent = styled.div<{ isMobile: boolean }>`
  flex-shrink: 0;
  margin-top: auto;
  padding-bottom: ${({ isMobile }) =>
    isMobile ? MOBILE_NAVIGATION_BAR_CLEARANCE : '0'};
  padding-inline-start: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-inline-end: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
`;

const advancedSettingsSwitchClassName = css`
  padding-inline-end: 0;
`;

export const SettingsNavigationDrawerContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useAtomState(
    isAdvancedModeEnabledState,
  );

  return (
    <>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <StyledAdvancedSwitchFixedContent isMobile={isMobile}>
        <NavigationDrawerSection>
          <AdvancedSettingsSwitch
            className={advancedSettingsSwitchClassName}
            isAdvancedModeEnabled={isAdvancedModeEnabled}
            setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
            label={t`Advanced`}
            isCompact={!isNavigationDrawerExpanded}
          />
        </NavigationDrawerSection>
      </StyledAdvancedSwitchFixedContent>
    </>
  );
};
