import { styled } from '@linaria/react';
import { GettingStartedSidebarCard } from '@/getting-started/components/GettingStartedSidebarCard';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';

import { MainNavigationDrawerContent } from '@/navigation/components/MainNavigationDrawerContent';
import { MainNavigationDrawerContextMenu } from '@/navigation/components/MainNavigationDrawerContextMenu';
import { MainNavigationDrawerSearchField } from '@/navigation/components/MainNavigationDrawerSearchField';
import { MainNavigationDrawerTabSwitcher } from '@/navigation/components/MainNavigationDrawerTabSwitcher';
import { NavigationDrawerHeader } from '@/navigation/components/NavigationDrawerHeader';
import { NavigationDrawerModeTransition } from '@/navigation/components/NavigationDrawerModeTransition';
import { SettingsNavigationDrawerContent } from '@/navigation/components/SettingsNavigationDrawerContent';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledBottomTabs = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  margin-bottom: calc(-1 * ${themeCssVariables.spacing[4]});
  margin-left: calc(-1 * ${themeCssVariables.spacing[2]});
  min-height: ${themeCssVariables.spacing[12]};
  padding: ${themeCssVariables.spacing[2]};
`;

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  // The main navigation is the home page on mobile, not a drawer.
  if (isMobile && !isSettingsDrawer) {
    return null;
  }

  const shouldPinTabsToBottom = isCustomizableSidebarEnabled && !isMobile;
  const gettingStartedCard = !isSettingsDrawer && <GettingStartedSidebarCard />;

  return (
    <NavigationDrawer className={className} header={<NavigationDrawerHeader />}>
      <MainNavigationDrawerContextMenu>
        {/* Mobile switches modes from the bottom navigation bar instead. */}
        {!isMobile && (
          <NavigationDrawerFixedContent>
            {shouldPinTabsToBottom ? (
              <MainNavigationDrawerSearchField />
            ) : (
              <MainNavigationDrawerTabSwitcher />
            )}
          </NavigationDrawerFixedContent>
        )}

        <NavigationDrawerModeTransition>
          {isSettingsDrawer ? (
            <SettingsNavigationDrawerContent />
          ) : (
            <MainNavigationDrawerContent />
          )}
        </NavigationDrawerModeTransition>

        {shouldPinTabsToBottom && !isSettingsDrawer && (
          <>
            {gettingStartedCard}
            <StyledBottomTabs>
              <MainNavigationDrawerTabSwitcher isPinnedToBottom />
            </StyledBottomTabs>
          </>
        )}
      </MainNavigationDrawerContextMenu>
      {!shouldPinTabsToBottom && gettingStartedCard}
    </NavigationDrawer>
  );
};
