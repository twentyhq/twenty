import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationDrawerTabbedContent } from '@/navigation/components/NavigationDrawerTabbedContent';
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

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  width: 100%;
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

  const activeTab = getMobileHomeActiveTab({
    navigationDrawerActiveTab,
    hasAiPermission,
  });

  const showAiChatContent =
    activeTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;

  const showSettingsContent = activeTab === NAVIGATION_DRAWER_TABS.SETTINGS;

  return (
    <StyledContainer>
      <NavigationDrawerFixedContent>
        <StyledTopRow>
          <MultiWorkspaceDropdownButton shouldHideLabel />
        </StyledTopRow>
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        <NavigationDrawerTabbedContent
          showAiChatContent={showAiChatContent}
          shouldMountAiChatContent={hasAiPermission}
          navigationContent={
            showSettingsContent ? (
              <SettingsNavigationDrawerItems />
            ) : (
              <MainNavigationDrawerNavigationContent />
            )
          }
        />
      </NavigationDrawerScrollableContent>
    </StyledContainer>
  );
};
