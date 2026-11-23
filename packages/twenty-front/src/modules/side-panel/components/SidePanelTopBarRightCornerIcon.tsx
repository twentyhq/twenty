import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { SidePanelAskAiNewChatButton } from '@/side-panel/pages/ask-ai/components/SidePanelAskAiNewChatButton';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { SidePanelPages } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageInfoSelector).page;
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

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (isMobile || !isOnAskAiPage) {
    return null;
  }

  return (
    <StyledIconButtonContainer>
      <SidePanelAskAiNewChatButton />
    </StyledIconButtonContainer>
  );
};
