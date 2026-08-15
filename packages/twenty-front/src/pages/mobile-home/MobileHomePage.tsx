import { MobileHomeAiChatSection } from '@/ai/components/MobileHomeAiChatSection';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
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

export const MobileHomePage = () => {
  const isMobile = useIsMobile();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  // Desktop keeps the drawer, so the page has nothing to show there.
  if (!isMobile) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return (
    <StyledContainer>
      <NavigationDrawerFixedContent>
        <MultiWorkspaceDropdownButton />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        <StyledSections>
          <MainNavigationDrawerNavigationContent />
          {hasAiPermission && <MobileHomeAiChatSection />}
        </StyledSections>
      </NavigationDrawerScrollableContent>
    </StyledContainer>
  );
};
