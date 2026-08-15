import { MobileHomeAiChatSection } from '@/ai/components/MobileHomeAiChatSection';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { getMobileHomeActiveTab } from '@/navigation/utils/getMobileHomeActiveTab';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  min-height: 0;
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

// The navigation content stretches to fill the drawer it was built for, which
// would push everything after it past the fold here.
const StyledNavigationSection = styled.div`
  flex: 0 0 auto;

  // :first-child only to outrank the single class selector it overrides, which
  // would otherwise be decided by stylesheet order.
  > *:first-child {
    height: auto;
  }
`;

export const MobileHomePage = () => {
  const isMobile = useIsMobile();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  // Desktop keeps the drawer, so the page has nothing to show there.
  if (!isMobile) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  const showSettingsContent =
    getMobileHomeActiveTab(navigationDrawerActiveTab) ===
    NAVIGATION_DRAWER_TABS.SETTINGS;

  return (
    <StyledContainer>
      <NavigationDrawerFixedContent>
        <MultiWorkspaceDropdownButton />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {showSettingsContent ? (
          <SettingsNavigationDrawerItems />
        ) : (
          <StyledSections>
            <StyledNavigationSection>
              <MainNavigationDrawerNavigationContent />
            </StyledNavigationSection>
            {hasAiPermission && <MobileHomeAiChatSection />}
          </StyledSections>
        )}
      </NavigationDrawerScrollableContent>
    </StyledContainer>
  );
};
