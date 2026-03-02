import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ theme, isExpanded }) => (isExpanded ? 0 : theme.spacing(4))};
  user-select: none;
  padding-right: ${({ theme }) => theme.spacing(2)};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  transition: gap ${({ theme }) => theme.animation.duration.normal}s ease;
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ theme, isExpanded }) => (isExpanded ? 0 : theme.spacing(1))};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : 0)};
  transition: gap ${({ theme }) => theme.animation.duration.normal}s ease;
`;

const StyledNavigationDrawerCollapseButton = styled(
  NavigationDrawerCollapseButton,
)`
  height: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(6)};
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledContainer isExpanded={isNavigationDrawerExpanded}>
      <MultiWorkspaceDropdownButton />
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
            <StyledNavigationDrawerCollapseButton direction="left" />
          )}
        </StyledRightActions>
      )}
    </StyledContainer>
  );
};
