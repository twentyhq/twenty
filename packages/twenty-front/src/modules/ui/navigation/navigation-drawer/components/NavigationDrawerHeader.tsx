import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: ${({ isExpanded }) => (isExpanded ? 'center' : 'flex-start')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ isExpanded }) => (isExpanded ? '0' : themeCssVariables.spacing[4])};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding-right: ${themeCssVariables.spacing[2]};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
  user-select: none;
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  align-self: ${({ isExpanded }) => (isExpanded ? 'auto' : 'flex-end')};
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ isExpanded }) => (isExpanded ? '0' : themeCssVariables.spacing[1])};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : '0')};
  transition: gap calc(${themeCssVariables.animation.duration.normal} * 1s) ease;
`;

const StyledNavigationDrawerCollapseButtonContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[6]};
    padding-right: ${themeCssVariables.spacing[1]};
    width: ${themeCssVariables.spacing[6]};
  }
`;

const StyledWorkspaceDropdownContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: ${themeCssVariables.spacing[8]};
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledContainer isExpanded={isNavigationDrawerExpanded}>
      <StyledWorkspaceDropdownContainer>
        <MultiWorkspaceDropdownButton />
      </StyledWorkspaceDropdownContainer>
      {!isMobile && (
        <StyledRightActions isExpanded={isNavigationDrawerExpanded}>
          <LightIconButton
            Icon={IconSearch}
            accent="secondary"
            size="small"
            onClick={openRecordsSearchPage}
            aria-label={t`Search`}
          />
          {isNavigationDrawerExpanded && showCollapseButton && (
            <StyledNavigationDrawerCollapseButtonContainer>
              <NavigationDrawerCollapseButton direction="left" />
            </StyledNavigationDrawerCollapseButtonContainer>
          )}
        </StyledRightActions>
      )}
    </StyledContainer>
  );
};
