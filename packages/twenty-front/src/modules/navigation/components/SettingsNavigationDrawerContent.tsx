import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useSetIsLogConsoleEnabled } from '@/log-console/hooks/useSetIsLogConsoleEnabled';
import { LogsSwitch } from '@/navigation/components/LogsSwitch';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { MOBILE_NAVIGATION_BAR_CLEARANCE } from '@/navigation/constants/MobileNavigationBarClearance';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledLogsSwitchFixedContent = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: ${TAB_LIST_HEIGHT};
  justify-content: center;
  margin-bottom: calc(-1 * ${themeCssVariables.spacing[4]});
  margin-top: auto;
`;

const StyledMobileNavigationBarClearance = styled.div`
  flex-shrink: 0;
  height: ${MOBILE_NAVIGATION_BAR_CLEARANCE};
`;

export const SettingsNavigationDrawerContent = () => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const isLogConsoleEnabled = useAtomStateValue(isLogConsoleEnabledState);
  const { setIsLogConsoleEnabled } = useSetIsLogConsoleEnabled();
  const isLogConsoleAllowed = useIsLogConsoleAllowed();

  return (
    <>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      {isLogConsoleAllowed && (
        <StyledLogsSwitchFixedContent>
          <NavigationDrawerSection>
            <LogsSwitch
              isEnabled={isLogConsoleEnabled}
              onEnabledChange={setIsLogConsoleEnabled}
              isCompact={!isNavigationDrawerExpanded}
            />
          </NavigationDrawerSection>
        </StyledLogsSwitchFixedContent>
      )}
      {isMobile && <StyledMobileNavigationBarClearance />}
    </>
  );
};
