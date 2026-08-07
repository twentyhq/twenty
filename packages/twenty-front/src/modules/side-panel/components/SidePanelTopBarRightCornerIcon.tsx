import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit, IconHistory } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { v4 } from 'uuid';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { navigateSidePanelMenu } = useSidePanelMenu();
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
  const isOnPreviousAiChatsPage =
    sidePanelPage === SidePanelPages.ViewPreviousAiChats;

  if (isMobile || (!isOnAskAiPage && !isOnPreviousAiChatsPage)) {
    return null;
  }

  const handlePreviousChatsClick = () => {
    navigateSidePanelMenu({
      page: SidePanelPages.ViewPreviousAiChats,
      pageTitle: t`Previous chats`,
      pageIcon: IconHistory,
      pageId: v4(),
    });
  };

  return (
    <StyledIconButtonContainer>
      {isOnAskAiPage && (
        <IconButton
          Icon={IconHistory}
          size="small"
          variant="tertiary"
          onClick={handlePreviousChatsClick}
          ariaLabel={t`Previous chats`}
        />
      )}
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
