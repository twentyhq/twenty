import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSearch } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ theme, isExpanded }) => (isExpanded ? 0 : theme.spacing(4))};
  user-select: none;
  padding-right: ${({ theme }) => theme.spacing(2)};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
`;

const StyledRightActions = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isExpanded }) => (isExpanded ? 'row' : 'column')};
  gap: ${({ theme, isExpanded }) => (isExpanded ? 0 : theme.spacing(1))};
  margin-left: ${({ isExpanded }) => (isExpanded ? 'auto' : 0)};
`;

const StyledNavigationDrawerCollapseButton = styled(
  NavigationDrawerCollapseButton,
)<{ show?: boolean }>`
  height: ${({ theme }) => theme.spacing(6)};
  opacity: ${({ show }) => (show ? 1 : 0)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  transition: opacity ${({ theme }) => theme.animation.duration.normal}s;
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
  const isNavigationDrawerExpanded = useRecoilValueV2(
    isNavigationDrawerExpandedState,
  );
  const activeTab = useRecoilValueV2(navigationDrawerActiveTabState);

  const showCollapseControl = showCollapseButton && activeTab !== 'chat';

  return (
    <StyledContainer isExpanded={isNavigationDrawerExpanded}>
      <MultiWorkspaceDropdownButton />
      {!isMobile && (
        <StyledRightActions isExpanded={isNavigationDrawerExpanded}>
          <LightIconButton
            Icon={IconSearch}
            accent="tertiary"
            size="small"
            onClick={openRecordsSearchPage}
            aria-label={t`Search`}
          />
          {isNavigationDrawerExpanded && (
            <StyledNavigationDrawerCollapseButton
              direction="left"
              show={showCollapseControl}
            />
          )}
        </StyledRightActions>
      )}
    </StyledContainer>
  );
};
