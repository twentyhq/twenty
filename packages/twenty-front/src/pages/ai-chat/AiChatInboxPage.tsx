import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useId } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { RecordSelectionRecordIdsEffect } from '@/object-record/record-selection/components/RecordSelectionRecordIdsEffect';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
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

const AiChatInboxPageContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const navigate = useNavigateApp();
  const { threadId } = useParams();
  const selectedThreadId =
    isDefined(threadId) && isValidUuid(threadId) ? threadId : undefined;
  const theme = useTheme();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const FilterStatusIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];
  const { threads, loading } = useChatThreads(agentChatVisibleThreadsSelector);
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { toggleRecordSelection } = useToggleRecordSelection();
  const { resetRecordSelection } = useResetRecordSelection();

  // Rows hold a menu and a rename input, which a link cannot contain
  const selectThread = (nextThreadId: string | null) =>
    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(AppPath.AiChatInbox, { threadId: nextThreadId });

  const handleThreadClick = (
    { id }: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    // A phone shows the list or a chat, with no room for the selection pane
    if (isMobile || (!event.metaKey && !event.ctrlKey && !event.shiftKey)) {
      resetRecordSelection();
      selectThread(id);
      return;
    }

    // A selection starts from the chat on screen
    if (
      selectedRecordIds.length === 0 &&
      isDefined(selectedThreadId) &&
      selectedThreadId !== id &&
      threads.some((thread) => thread.id === selectedThreadId)
    ) {
      toggleRecordSelection({ recordId: selectedThreadId });
    }

    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });
  };

  const isSelectionShown =
    selectedRecordIds.length > 1 ||
    (selectedRecordIds.length === 1 &&
      selectedRecordIds[0] !== selectedThreadId);
  const openThreadIds = isDefined(selectedThreadId) ? [selectedThreadId] : [];
  const highlightedThreadIds = isSelectionShown
    ? selectedRecordIds
    : openThreadIds;

  // A phone has room for the list or the chat, not both
  const isListShown = !isMobile || !isDefined(selectedThreadId);
  const isThreadShown = !isMobile || isDefined(selectedThreadId);

  return (
    <StyledInbox>
      <RecordSelectionRecordIdsEffect records={threads} />
      {!isMobile && (
        <AiChatInboxSelectionEffect
          selectedThreadId={selectedThreadId}
          threads={threads}
        />
      )}
      {isListShown && (
        <StyledListPane $isFullWidth={isMobile}>
          <PageCardLayout
            showInformationBanner={isMobile}
            header={
              <PageCardHeader
                icon={<FilterStatusIcon size={theme.icon.size.md} />}
                title={t(
                  AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[
                    agentChatThreadFilterStatus
                  ],
                )}
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
                  selectedThreadIds={highlightedThreadIds}
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
          <AiChatInboxSelectionPane />
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

export const AiChatInboxPage = () => {
  // A new instance per visit, so a selection does not outlive the inbox
  const recordSelectionInstanceId = useId();

  return (
    <RecordSelectionComponentInstanceContext.Provider
      value={{ instanceId: recordSelectionInstanceId }}
    >
      <AiChatInboxPageContent />
    </RecordSelectionComponentInstanceContext.Provider>
  );
};
