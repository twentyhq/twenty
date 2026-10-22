import { FrontComponentMediaSessionIndicator } from '@/front-components/media-session/components/FrontComponentMediaSessionIndicator';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconSearch } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { MultiWorkspaceDropdownButton } from '@/navigation/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useIsMobile } from 'twenty-ui/utilities';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  flex-shrink: 0;
  user-select: none;
`;

const StyledHeaderRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: 0 ${themeCssVariables.spacing[7]};
  }
`;

const StyledCollapsedSearch = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]};
`;

const StyledRightActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  margin-left: auto;
`;

const StyledWorkspaceDropdownContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

export const NavigationDrawerHeader = () => {
  const isMobile = useIsMobile();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  const searchButton = !isMobile && (
    <LightIconButton
      emphasis="standard"
      size={isExpanded ? 'sm' : 'md'}
      onClick={openRecordsSearchPage}
      aria-label={t`Search`}
    >
      <IconSearch />
    </LightIconButton>
  );

  return (
    <StyledContainer>
      <StyledHeaderRow>
        <StyledWorkspaceDropdownContainer>
          <MultiWorkspaceDropdownButton />
        </StyledWorkspaceDropdownContainer>
        {isExpanded && (
          <StyledRightActions>
            <FrontComponentMediaSessionIndicator />
            {searchButton}
            <NavigationDrawerCollapseButton
              direction="left"
              size={isMobile ? 'md' : 'sm'}
            />
          </StyledRightActions>
        )}
      </StyledHeaderRow>
      {!isExpanded && !isMobile && (
        <StyledCollapsedSearch>
          <FrontComponentMediaSessionIndicator />
          {searchButton}
        </StyledCollapsedSearch>
      )}
    </StyledContainer>
  );
};
