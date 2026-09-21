import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

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
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]};
`;

const StyledSearchButtonContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;

  > button {
    height: ${({ isExpanded }) =>
      isExpanded
        ? themeCssVariables.spacing[6]
        : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
    width: ${({ isExpanded }) =>
      isExpanded
        ? themeCssVariables.spacing[6]
        : `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`};
  }
`;

const StyledRightActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  margin-left: auto;
`;

const StyledNavigationDrawerCollapseButtonContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[6]};
    padding-right: 0;
    width: ${themeCssVariables.spacing[6]};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    > * {
      height: ${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px;
      padding-right: 0;
      width: ${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px;
    }
  }
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
    <StyledSearchButtonContainer isExpanded={isExpanded}>
      <LightIconButton
        emphasis="standard"
        size="sm"
        onClick={openRecordsSearchPage}
        aria-label={t`Search`}
      >
        <IconSearch />
      </LightIconButton>
    </StyledSearchButtonContainer>
  );

  return (
    <StyledContainer>
      <StyledHeaderRow>
        <StyledWorkspaceDropdownContainer>
          <MultiWorkspaceDropdownButton />
        </StyledWorkspaceDropdownContainer>
        {isExpanded && (
          <StyledRightActions>
            {searchButton}
            <StyledNavigationDrawerCollapseButtonContainer>
              <NavigationDrawerCollapseButton direction="left" />
            </StyledNavigationDrawerCollapseButtonContainer>
          </StyledRightActions>
        )}
      </StyledHeaderRow>
      {!isExpanded && !isMobile && (
        <StyledCollapsedSearch>{searchButton}</StyledCollapsedSearch>
      )}
    </StyledContainer>
  );
};
