import { aiChatNewThreadChannelIdState } from '@/ai/states/aiChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isInboxPath } from '~/utils/isInboxPath';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageInfoSelector).page;
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );
  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);
  const setAiChatNewThreadChannelId = useSetAtomState(
    aiChatNewThreadChannelIdState,
  );
  const [sidePanelSearchObjectFilter, setSidePanelSearchObjectFilter] =
    useAtomState(sidePanelSearchObjectFilterState);

  const handleNewChatClick = () => {
    if (!isInboxPath(window.location.pathname)) {
      setAiChatNewThreadChannelId(null);
    }

    setAskAiSidePanelThreadId(newAiChatThreadId);
    setShouldFocusChatEditor(true);
  };

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
      <IconButton
        size="sm"
        variant="ghost"
        onClick={handleNewChatClick}
        aria-label={t`New conversation`}
      >
        <IconEdit />
      </IconButton>
    </StyledIconButtonContainer>
  );
};
