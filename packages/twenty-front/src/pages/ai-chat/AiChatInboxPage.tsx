import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useId, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxBreadcrumb } from '@/ai/components/AiChatInboxBreadcrumb';
import { AiChatInboxCommandMenuScope } from '@/ai/components/AiChatInboxCommandMenuScope';
import { AiChatInboxListHeader } from '@/ai/components/AiChatInboxListHeader';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatInboxSelectionToContextStoreEffect } from '@/ai/components/AiChatInboxSelectionToContextStoreEffect';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { AiChatInboxThreadPagination } from '@/ai/components/AiChatInboxThreadPagination';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useIsAiChatInboxSplitView } from '@/ai/hooks/useIsAiChatInboxSplitView';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
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
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
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
  const isSplitView = useIsAiChatInboxSplitView();
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
    // A phone has no modifier keys, so once a selection is started a tap
    // adds to it
    if (isMobile && selectedRecordIds.length > 0) {
      toggleRecordSelection({ recordId: id });
      return;
    }

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

  // Split view shows the list beside the chat or the selection; otherwise
  // the list and a chat each take the whole page
  const isListShown = isSplitView || !isDefined(selectedThreadId);
  const isSelectionPaneShown = isSplitView && isSelectionShown;
  const isThreadShown = isDefined(selectedThreadId) && !isSelectionPaneShown;
  const isEmptyPaneShown =
    isSplitView && !isDefined(selectedThreadId) && !isSelectionShown;

  const openThreadIds =
    isDefined(selectedThreadId) && !isSelectionShown ? [selectedThreadId] : [];

  return (
    <StyledInbox>
      <RecordSelectionRecordIdsEffect records={threads} />
      <AiChatInboxSelectionEffect
        selectedThreadId={selectedThreadId}
        threads={threads}
        shouldSelectFirstThread={isSplitView}
      />
      {/* The selection takes the place of the chat on screen, so the command
      menu acts on it */}
      {isSelectionShown && !isThreadShown && (
        <AiChatInboxSelectionToContextStoreEffect
          contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
        />
      )}
      <AiChatInboxCommandMenuScope>
        {isListShown && (
          <StyledListPane $isFullWidth={!isSplitView}>
            <PageCardLayout
              showInformationBanner={!isSplitView}
              header={
                <AiChatInboxListHeader
                  selectedThreadCount={selectedRecordIds.length}
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
                      checkedThreadIds={selectedRecordIds}
                      onThreadClick={handleThreadClick}
                      onThreadCheckboxClick={handleThreadCheckboxClick}
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
        {isSelectionPaneShown && (
          <AiChatInboxSelectionPane
            selectedThreads={threads.filter(({ id }) =>
              selectedRecordIds.includes(id),
            )}
          />
        )}
      </AiChatInboxCommandMenuScope>
      {isThreadShown && (
        <>
          <AiChatPageEffects />
          <AiChatThreadPageContent
            threadId={selectedThreadId}
            headerTitlePrefix={
              !isSplitView && !isMobile && <AiChatInboxBreadcrumb />
            }
            headerActions={
              isMobile ? (
                <IconButton
                  size="sm"
                  variant="outline"
                  onClick={() => selectThread(null)}
                  aria-label={t`Back to inbox`}
                >
                  <IconChevronLeft />
                </IconButton>
              ) : (
                <AiChatInboxThreadPagination
                  threads={threads}
                  threadId={selectedThreadId}
                  onThreadSelect={selectThread}
                />
              )
            }
          />
        </>
      )}
      {isEmptyPaneShown && (
        <PageCardLayout header={<PageCardHeader />}>
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Title>{t`No conversation selected`}</EmptyState.Title>
            </EmptyState.Content>
          </EmptyState.Root>
        </PageCardLayout>
      )}
    </StyledInbox>
  );
};

export const AiChatInboxPage = () => {
  // A new instance per visit, so a selection does not outlive the inbox
  const recordSelectionInstanceId = useId();
  const { threadId } = useParams();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  if (!isAiChatInboxEnabled) {
    return (
      <Navigate
        to={getAppPath(AppPath.AiChat, { threadId: threadId ?? null })}
        replace
      />
    );
  }

  return (
    <RecordSelectionComponentInstanceContext.Provider
      value={{ instanceId: recordSelectionInstanceId }}
    >
      <AiChatInboxPageContent />
    </RecordSelectionComponentInstanceContext.Provider>
  );
};
