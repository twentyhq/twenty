import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { matchSidePanelHostableRoute } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconEdit } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const currentRoutedPath = useCurrentSidePanelRoutedPath();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const [sidePanelSearchObjectFilter, setSidePanelSearchObjectFilter] =
    useAtomState(sidePanelSearchObjectFilterState);

  const isOnSearchPage = sidePanelPage === SidePanelPages.SearchRecords;

  if (isOnSearchPage) {
    return (
      <SidePanelObjectFilterDropdown
        selectedObjectNameSingular={sidePanelSearchObjectFilter}
        onSelectObject={setSidePanelSearchObjectFilter}
      />
    );
  }

  const isOnRoutedPage = sidePanelPage === SidePanelPages.RoutedPage;

  const hostableRouteMatch =
    isOnRoutedPage && isDefined(currentRoutedPath)
      ? matchSidePanelHostableRoute(currentRoutedPath)
      : undefined;

  const TopBarRightCorner = hostableRouteMatch?.route.TopBarRightCorner;

  if (isDefined(TopBarRightCorner) && isDefined(hostableRouteMatch) && !isMobile) {
    return (
      <StyledIconButtonContainer>
        <TopBarRightCorner match={hostableRouteMatch.match} />
      </StyledIconButtonContainer>
    );
  }

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (isMobile || !isOnAskAiPage) {
    return null;
  }

  return (
    <StyledIconButtonContainer>
      <IconButton
        Icon={IconEdit}
        size="small"
        variant="tertiary"
        onClick={() => switchToNewChat()}
        ariaLabel={t`New conversation`}
      />
    </StyledIconButtonContainer>
  );
};
