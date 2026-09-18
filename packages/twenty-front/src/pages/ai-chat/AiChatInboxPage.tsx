import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatChannelDeleteConfirmationModal } from '@/ai/components/AiChatChannelDeleteConfirmationModal';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { AiChatInboxTabs } from '@/ai/components/AiChatInboxTabs';
import { AiChatMarkThreadReadEffect } from '@/ai/components/AiChatMarkThreadReadEffect';
import { AiChatSelectFirstThreadEffect } from '@/ai/components/AiChatSelectFirstThreadEffect';
import { AiChatUnreadThreadsEffect } from '@/ai/components/AiChatUnreadThreadsEffect';
import { AiChatInboxThreadPane } from '@/ai/components/AiChatInboxThreadPane';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AI_CHAT_INBOX_TABS_INSTANCE_ID } from '@/ai/constants/AiChatInboxTabsInstanceId';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { agentChatInboxStateTabState } from '@/ai/states/agentChatInboxStateTabState';
import { agentChatInboxTabState } from '@/ai/states/agentChatInboxTabState';
import { AGENT_CHAT_THREAD_INBOX_STATE_LABELS } from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CollapseNavigationDrawerWhileSidePanelOpenEffect } from '@/navigation/components/CollapseNavigationDrawerWhileSidePanelOpenEffect';
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

const StyledHeaderState = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.regular};

  &::before {
    content: '·';
    margin: 0 ${themeCssVariables.spacing[1]};
  }
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
  const agentChatInboxStateTab = useAtomStateValue(agentChatInboxStateTabState);
  const [agentChatInboxTab, setAgentChatInboxTab] = useAtomState(
    agentChatInboxTabState,
  );
  const { getThreadsForInboxStateAndTab, getCountByInboxTab } =
    useAiChatInboxThreads();

  const isChatVisible = !isMobile || isDefined(threadId);
  const isListVisible = !isMobile || !isChatVisible;

  const backToList = () => navigateApp(AppPath.AiChatInbox, { threadId: null });

  return (
    <StyledPanel>
      {isListVisible && (
        <StyledListPane $isAlone={!isChatVisible}>
          {/* Two questions, two controls: the drawer picks the state the
              thread is in, the tabs pick why it is yours. */}
          <StyledHeader>
            {t`Inbox`}
            <StyledHeaderState>
              {t(AGENT_CHAT_THREAD_INBOX_STATE_LABELS[agentChatInboxStateTab])}
            </StyledHeaderState>
          </StyledHeader>
          <AiChatInboxTabs
            componentInstanceId={AI_CHAT_INBOX_TABS_INSTANCE_ID}
            countByInboxTab={getCountByInboxTab(agentChatInboxStateTab)}
            onChangeInboxTab={setAgentChatInboxTab}
          />
          <StyledListBody>
            <AiChatInboxThreadList
              inboxState={agentChatInboxStateTab}
              inboxTab={agentChatInboxTab}
            />
          </StyledListBody>
        </StyledListPane>
      )}
      {isChatVisible && (
        <AiChatInboxThreadPane
          onBackToList={isMobile ? backToList : undefined}
        />
      )}
      {/* On a phone the two panes take turns, so opening the inbox on a thread
          would hide the list the reader came for. */}
      {!isMobile && (
        <AiChatSelectFirstThreadEffect
          channelId={null}
          firstThreadId={
            getThreadsForInboxStateAndTab(
              agentChatInboxStateTab,
              agentChatInboxTab,
            ).at(0)?.id
          }
          isThreadSelected={isDefined(threadId)}
        />
      )}
      <AiChatUnreadThreadsEffect
        threadIds={getThreadsForInboxStateAndTab(
          agentChatInboxStateTab,
          agentChatInboxTab,
        ).map((thread) => thread.id)}
      />
      <AiChatMarkThreadReadEffect threadId={threadId ?? null} />
      <CollapseNavigationDrawerWhileSidePanelOpenEffect />
      {/* Thread rows on this page use the side panel action surface. */}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
      <AiChatChannelDeleteConfirmationModal />
    </StyledPanel>
  );
};
