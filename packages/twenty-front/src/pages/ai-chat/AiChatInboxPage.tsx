import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useId, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatChannelThreadsFetchMoreTrigger } from '@/ai/components/AgentChatChannelThreadsFetchMoreTrigger';
import { AgentChatChannelThreadsLoadEffect } from '@/ai/components/AgentChatChannelThreadsLoadEffect';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxChannelToolbar } from '@/ai/components/AiChatInboxChannelToolbar';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxCommandMenuScope } from '@/ai/components/AiChatInboxCommandMenuScope';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatChannelVisibleThreadsSelector } from '@/ai/states/selectors/agentChatChannelVisibleThreadsSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
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

const StyledListContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledThreadListContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
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
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === agentChatShownChannelView?.channelId,
  );
  const agentChatChannelThreadList = useAtomStateValue(
    agentChatChannelThreadListState,
  );
  const ChannelIcon = useAgentChatChannelIcon(channel?.icon);
  const HeaderIcon = isDefined(agentChatShownChannelView)
    ? ChannelIcon
    : AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];
  const headerTitle = isDefined(agentChatShownChannelView)
    ? (channel?.name ?? '')
    : t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus]);
  const { threads, loading: isThreadListLoading } = useChatThreads(
    isDefined(agentChatShownChannelView)
      ? agentChatChannelVisibleThreadsSelector
      : agentChatVisibleThreadsSelector,
  );
  const loading =
    isThreadListLoading ||
    (isDefined(agentChatShownChannelView) &&
      agentChatChannelThreadList?.viewKey !==
        getAgentChatChannelViewKey(agentChatShownChannelView));
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });

  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const { toggleRecordSelection } = useToggleRecordSelection();
  const threadListContainerRef = useRef<HTMLDivElement>(null);
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
      <AgentChatChannelThreadsLoadEffect />
      <RecordSelectionRecordIdsEffect records={threads} />
      {!isMobile && (
        <AiChatInboxSelectionEffect
          selectedThreadId={selectedThreadId}
          threads={threads}
        />
      )}
      <AiChatInboxCommandMenuScope>
        {isListShown && (
          <StyledListPane $isFullWidth={isMobile}>
            <PageCardLayout
              showInformationBanner={isMobile}
              header={
                <PageCardHeader
                  icon={<HeaderIcon size={theme.icon.size.md} />}
                  title={headerTitle}
                  actionButton={
                    <Button
                      size="sm"
                      variant="solid"
                      color="accent"
                      startIcon={<IconPlus />}
                      onClick={() =>
                        switchToNewChat({
                          channelId:
                            agentChatShownChannelView?.channelId ?? null,
                        })
                      }
                    >
                      {t`New chat`}
                    </Button>
                  }
                />
              }
            >
              <StyledListContent>
                {isDefined(agentChatShownChannelView) && (
                  <AiChatInboxChannelToolbar
                    channelView={agentChatShownChannelView}
                  />
                )}
                <StyledThreadListContainer ref={threadListContainerRef}>
                  <StyledThreadList>
                    {loading && threads.length === 0 ? (
                      <SkeletonLoader />
                    ) : threads.length === 0 ? (
                      <EmptyState.Root>
                        <AnimatedPlaceholder type="emptyInbox" />
                        <EmptyState.Content>
                          <EmptyState.Title>{t`No conversations`}</EmptyState.Title>
                          <EmptyState.Description>
                            {isDefined(agentChatShownChannelView)
                              ? t`Conversations in this channel will appear here.`
                              : t`Conversations you can open will appear here.`}
                          </EmptyState.Description>
                        </EmptyState.Content>
                      </EmptyState.Root>
                    ) : (
                      <AiChatInboxThreadList
                        threads={threads}
                        selectedThreadIds={highlightedThreadIds}
                        onThreadClick={handleThreadClick}
                      />
                    )}
                    {isDefined(agentChatShownChannelView) ? (
                      <AgentChatChannelThreadsFetchMoreTrigger />
                    ) : (
                      <AgentChatThreadsFetchMoreTrigger />
                    )}
                  </StyledThreadList>
                  {!isMobile && (
                    <RecordSelectionDragSelect
                      selectableItemsContainerRef={threadListContainerRef}
                    />
                  )}
                </StyledThreadListContainer>
              </StyledListContent>
            </PageCardLayout>
          </StyledListPane>
        )}
        {isThreadShown && isSelectionShown && <AiChatInboxSelectionPane />}
      </AiChatInboxCommandMenuScope>
      {isThreadShown &&
        !isSelectionShown &&
        (isDefined(selectedThreadId) ? (
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
