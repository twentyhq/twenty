import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatPageCloseSidePanelChatEffect } from '@/ai/components/AiChatPageCloseSidePanelChatEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

const AI_CHAT_INBOX_LIST_WIDTH = 400;

const StyledInbox = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const StyledListPane = styled.div<{ $isFullWidth: boolean }>`
  display: flex;
  flex: ${({ $isFullWidth }) =>
    $isFullWidth ? '1' : `0 0 ${AI_CHAT_INBOX_LIST_WIDTH}px`};
  min-width: 0;
`;

const StyledThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 0;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

export const AiChatInboxPage = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const navigate = useNavigateApp();
  const { threadId } = useParams();
  const selectedThreadId =
    isDefined(threadId) && isValidUuid(threadId) ? threadId : undefined;
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);
  const { threads, loading } = useChatThreads(agentChatVisibleThreadsSelector);
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  // Rows hold a menu and a rename input, which a link cannot contain
  const selectThread = (nextThreadId: string | null) =>
    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(AppPath.AiChatInbox, { threadId: nextThreadId });

  // A phone has room for the list or the chat, not both
  const isListShown = !isMobile || !isDefined(selectedThreadId);
  const isThreadShown = !isMobile || isDefined(selectedThreadId);

  return (
    <StyledInbox>
      {!isMobile && (
        <AiChatInboxSelectionEffect
          selectedThreadId={selectedThreadId}
          threads={threads}
        />
      )}
      {isListShown && (
        <StyledListPane $isFullWidth={isMobile}>
          <PageCardLayout
            header={
              <PageCardHeader
                title={<AiChatThreadFilterDropdown />}
                actionButton={
                  <Button
                    size="sm"
                    variant="solid"
                    color="accent"
                    startIcon={<IconPlus />}
                    onClick={switchToNewChat}
                  >
                    {t`New chat`}
                  </Button>
                }
              />
            }
          >
            <StyledThreadList>
              {loading && threads.length === 0 ? (
                <SkeletonLoader />
              ) : threads.length === 0 ? (
                <EmptyState.Root>
                  <AnimatedPlaceholder type="emptyInbox" />
                  <EmptyState.Content>
                    <EmptyState.Title>{t`No conversations`}</EmptyState.Title>
                    <EmptyState.Description>
                      {t`Conversations you can open will appear here.`}
                    </EmptyState.Description>
                  </EmptyState.Content>
                </EmptyState.Root>
              ) : (
                <AiChatThreadList
                  threads={threads}
                  surface={AI_CHAT_THREAD_ACTIONS_SURFACE.INBOX_PAGE}
                  selectedThreadId={selectedThreadId}
                  isGroupedByDate={
                    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE
                  }
                  onThreadClick={({ id }) => selectThread(id)}
                />
              )}
              <AgentChatThreadsFetchMoreTrigger />
            </StyledThreadList>
          </PageCardLayout>
        </StyledListPane>
      )}
      {isThreadShown &&
        (isDefined(selectedThreadId) ? (
          <>
            <AiChatPageThreadUrlSyncEffect />
            <AiChatPageCloseSidePanelChatEffect />
            <AiChatPageContinueInSidePanelEffect />
            <AiChatThreadPageContent
              threadId={selectedThreadId}
              headerActions={
                isMobile && (
                  <IconButton
                    size="sm"
                    variant="outline"
                    onClick={() => selectThread(null)}
                    aria-label={t`Back to inbox`}
                  >
                    <IconChevronLeft />
                  </IconButton>
                )
              }
            />
          </>
        ) : (
          <PageCardLayout header={<PageCardHeader />}>
            <EmptyState.Root>
              <EmptyState.Content>
                <EmptyState.Title>{t`No conversation selected`}</EmptyState.Title>
              </EmptyState.Content>
            </EmptyState.Root>
          </PageCardLayout>
        ))}
    </StyledInbox>
  );
};
