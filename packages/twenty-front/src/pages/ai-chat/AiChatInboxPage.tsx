import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useId, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxCommandMenuScope } from '@/ai/components/AiChatInboxCommandMenuScope';
import { AiChatInboxListHeader } from '@/ai/components/AiChatInboxListHeader';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
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
  min-height: 0;
  overflow: auto;
`;

const AiChatInboxPageContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const navigate = useNavigateApp();
  const { threadId } = useParams();
  const selectedThreadId =
    isDefined(threadId) && isValidUuid(threadId) ? threadId : undefined;
  const { threads, loading } = useChatThreads(agentChatVisibleThreadsSelector);

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

  const handleThreadCheckboxClick = (
    { id }: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) =>
    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });

  const isSelectionShown = selectedRecordIds.length > 0;
  const openThreadIds =
    isDefined(selectedThreadId) && !isSelectionShown ? [selectedThreadId] : [];
  const checkedThreadIds = isSelectionShown ? selectedRecordIds : [];

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
      <AiChatInboxCommandMenuScope>
        {isListShown && (
          <StyledListPane $isFullWidth={isMobile}>
            <PageCardLayout
              showInformationBanner={isMobile}
              header={
                <AiChatInboxListHeader
                  selectedThreadCount={
                    isSelectionShown ? selectedRecordIds.length : 0
                  }
                />
              }
            >
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
                          {t`Conversations you can open will appear here.`}
                        </EmptyState.Description>
                      </EmptyState.Content>
                    </EmptyState.Root>
                  ) : (
                    <AiChatInboxThreadList
                      threads={threads}
                      selectedThreadIds={openThreadIds}
                      checkedThreadIds={checkedThreadIds}
                      onThreadClick={handleThreadClick}
                      onThreadCheckboxClick={
                        isMobile ? undefined : handleThreadCheckboxClick
                      }
                    />
                  )}
                  <AgentChatThreadsFetchMoreTrigger />
                </StyledThreadList>
                {!isMobile && (
                  <RecordSelectionDragSelect
                    selectableItemsContainerRef={threadListContainerRef}
                  />
                )}
              </StyledThreadListContainer>
            </PageCardLayout>
          </StyledListPane>
        )}
        {isThreadShown && isSelectionShown && (
          <AiChatInboxSelectionPane
            selectedThreads={threads.filter(({ id }) =>
              selectedRecordIds.includes(id),
            )}
          />
        )}
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
