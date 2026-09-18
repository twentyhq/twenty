import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatChannelDeleteConfirmationModal } from '@/ai/components/AiChatChannelDeleteConfirmationModal';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { AiChatInboxThreadPane } from '@/ai/components/AiChatInboxThreadPane';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatThreadInboxStateTabs } from '@/ai/components/AiChatThreadInboxStateTabs';
import { AGENT_CHAT_THREAD_INBOX_STATE_ORDER } from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { AI_CHAT_INBOX_TABS_INSTANCE_ID } from '@/ai/constants/AiChatInboxTabsInstanceId';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { agentChatInboxStateTabState } from '@/ai/states/agentChatInboxStateTabState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const INBOX_THREAD_LIST_PANE_WIDTH = 400;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledListPane = styled.div<{ $isAlone: boolean }>`
  border-right: ${({ $isAlone }) =>
    $isAlone ? 'none' : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${({ $isAlone }) =>
    $isAlone ? '100%' : `${INBOX_THREAD_LIST_PANE_WIDTH}px`};
`;

const StyledHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 40px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledListBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

export const AiChatInboxPage = () => {
  const { t } = useLingui();
  const { threadId } = useParams();
  const isMobile = useIsMobile();
  const navigateApp = useNavigateApp();
  const [inboxState, setInboxState] = useAtomState(agentChatInboxStateTabState);
  const { threadsByInboxState } = useAiChatInboxThreads();

  const countByInboxState = AGENT_CHAT_THREAD_INBOX_STATE_ORDER.reduce(
    (accumulator, state) => {
      accumulator[state] = threadsByInboxState[state].length;

      return accumulator;
    },
    {} as Record<AgentChatThreadInboxState, number>,
  );

  const isChatVisible = !isMobile || isDefined(threadId);
  const isListVisible = !isMobile || !isChatVisible;

  const backToList = () =>
    navigateApp(AppPath.AiChatInbox, { threadId: null });

  return (
    <StyledPanel>
      {isListVisible && (
        <StyledListPane $isAlone={!isChatVisible}>
          <StyledHeader>{t`Inbox`}</StyledHeader>
          <AiChatThreadInboxStateTabs
            componentInstanceId={AI_CHAT_INBOX_TABS_INSTANCE_ID}
            countByInboxState={countByInboxState}
            onChangeInboxState={setInboxState}
          />
          <StyledListBody>
            <AiChatInboxThreadList inboxState={inboxState} />
          </StyledListBody>
        </StyledListPane>
      )}
      {isChatVisible && (
        <AiChatInboxThreadPane
          onBackToList={isMobile ? backToList : undefined}
        />
      )}
      {/* Thread rows on this page use the side panel action surface. */}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
      <AiChatChannelDeleteConfirmationModal />
    </StyledPanel>
  );
};
