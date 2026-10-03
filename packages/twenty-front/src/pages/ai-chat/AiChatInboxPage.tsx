import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
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
import { AiChatInboxRecordIdsEffect } from '@/ai/components/AiChatInboxRecordIdsEffect';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID } from '@/ai/constants/AiChatInboxRecordSelectionInstanceId';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

const StyledInbox = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const StyledListPane = styled.div<{ $isFullWidth: boolean }>`
  display: flex;
  flex: ${({ $isFullWidth }) => ($isFullWidth ? '1' : '0 0 400px')};
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

  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
    AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID,
  );
  const { toggleRecordSelection } = useToggleRecordSelection(
    AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID,
  );
  const { resetRecordSelection } = useResetRecordSelection(
    AI_CHAT_INBOX_RECORD_SELECTION_INSTANCE_ID,
  );

  // Rows hold a menu and a rename input, which a link cannot contain
  const selectThread = (nextThreadId: string | null) =>
    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(AppPath.AiChatInbox, { threadId: nextThreadId });

  const handleThreadClick = (
    { id }: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
      resetRecordSelection();
      selectThread(id);
      return;
    }

    // A selection starts from the chat on screen
    if (
      selectedRecordIds.length === 0 &&
      isDefined(selectedThreadId) &&
      selectedThreadId !== id
    ) {
      toggleRecordSelection({ recordId: selectedThreadId });
    }

    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });
  };

  const isSelectionShown =
    selectedRecordIds.length > 1 ||
    (selectedRecordIds.length === 1 &&
      selectedRecordIds[0] !== selectedThreadId);

  // A phone has room for the list or the chat, not both
  const isListShown = !isMobile || !isDefined(selectedThreadId);
  const isThreadShown = !isMobile || isDefined(selectedThreadId);

  return (
    <StyledInbox>
      <AiChatInboxRecordIdsEffect threads={threads} />
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
                  selectedThreadIds={
                    isSelectionShown
                      ? selectedRecordIds
                      : isDefined(selectedThreadId)
                        ? [selectedThreadId]
                        : []
                  }
                  isGroupedByDate={
                    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE
                  }
                  onThreadClick={handleThreadClick}
                />
              )}
              <AgentChatThreadsFetchMoreTrigger />
            </StyledThreadList>
          </PageCardLayout>
        </StyledListPane>
      )}
      {isThreadShown &&
        (isSelectionShown ? (
          <AiChatInboxSelectionPane
            numberOfSelectedThreads={selectedRecordIds.length}
            onClearSelection={resetRecordSelection}
          />
        ) : isDefined(selectedThreadId) ? (
          <>
            <AiChatPageEffects />
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
