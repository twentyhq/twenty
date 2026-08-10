import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const [sidePanelSearchObjectFilter, setSidePanelSearchObjectFilter] =
    useAtomState(sidePanelSearchObjectFilterState);
  const isSearchPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SEARCH_PAGE_ENABLED,
  );

  const isOnSearchPage = sidePanelPage === SidePanelPages.SearchRecords;

  // The full search page owns object filtering, so the panel gives the slot to
  // the button that opens it. Mobile has no full page, so it keeps the filter.
  if (isOnSearchPage && (!isSearchPageEnabled || isMobile)) {
    return (
      <SidePanelObjectFilterDropdown
        selectedObjectNameSingular={sidePanelSearchObjectFilter}
        onSelectObject={setSidePanelSearchObjectFilter}
      />
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
