import { styled } from '@linaria/react';
import { AnimatePresence } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Key } from 'ts-key-enum';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { IconChevronLeft, IconX } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AgentChatChannelThreadsFetchMoreTrigger } from '@/ai/components/AgentChatChannelThreadsFetchMoreTrigger';
import { AgentChatChannelThreadsLoadEffect } from '@/ai/components/AgentChatChannelThreadsLoadEffect';
import { AgentChatThreadsFetchMoreTrigger } from '@/ai/components/AgentChatThreadsFetchMoreTrigger';
import { AiChatInboxBreadcrumb } from '@/ai/components/AiChatInboxBreadcrumb';
import { AiChatInboxChannelToolbar } from '@/ai/components/AiChatInboxChannelToolbar';
import { AiChatInboxCommandMenuScope } from '@/ai/components/AiChatInboxCommandMenuScope';
import { AiChatInboxConversationPane } from '@/ai/components/AiChatInboxConversationPane';
import { AiChatInboxListHeader } from '@/ai/components/AiChatInboxListHeader';
import { AiChatInboxNewThreadChannelEffect } from '@/ai/components/AiChatInboxNewThreadChannelEffect';
import { AiChatInboxSelectionEffect } from '@/ai/components/AiChatInboxSelectionEffect';
import { AiChatInboxSelectionPane } from '@/ai/components/AiChatInboxSelectionPane';
import { AiChatInboxSelectionToContextStoreEffect } from '@/ai/components/AiChatInboxSelectionToContextStoreEffect';
import { AiChatInboxThreadList } from '@/ai/components/AiChatInboxThreadList';
import { AiChatInboxThreadPagination } from '@/ai/components/AiChatInboxThreadPagination';
import { AI_CHAT_INBOX_LIST_PANE_WIDTH } from '@/ai/constants/AiChatInboxListPaneWidth';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useAgentChatInboxShownThreads } from '@/ai/hooks/useAgentChatInboxShownThreads';
import { useAiChatInboxRecordSelectionInstanceId } from '@/ai/hooks/useAiChatInboxRecordSelectionInstanceId';
import { useFetchMoreAgentChatInboxShownThreads } from '@/ai/hooks/useFetchMoreAgentChatInboxShownThreads';
import { useIsAiChatInboxSplitView } from '@/ai/hooks/useIsAiChatInboxSplitView';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isSidePanelItemShowingAiChat } from '@/ai/utils/isSidePanelItemShowingAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
import { RecordSelectionRecordIdsEffect } from '@/object-record/record-selection/components/RecordSelectionRecordIdsEffect';
import { useRecordSelectionArrowKeyNavigation } from '@/object-record/record-selection/hooks/useRecordSelectionArrowKeyNavigation';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AiChatNewThreadPageContent } from '~/pages/ai-chat/AiChatNewThreadPageContent';
import { AiChatPageEffects } from '~/pages/ai-chat/AiChatPageEffects';
import { AiChatThreadPageContent } from '~/pages/ai-chat/AiChatThreadPageContent';

const StyledInbox = styled.div`
  --inbox-list-pane-width: ${AI_CHAT_INBOX_LIST_PANE_WIDTH}px;

  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const StyledListPane = styled.div<{ $isFullWidth: boolean }>`
  display: flex;
  flex: 0 0 auto;
  min-width: 0;
  transition: width calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;
  width: ${({ $isFullWidth }) =>
    $isFullWidth ? '100%' : 'var(--inbox-list-pane-width)'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
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
  min-height: 0;
  overflow: auto;
`;

const AiChatInboxPageContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSplitView = useIsAiChatInboxSplitView();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const navigate = useNavigateApp();
  const { threadId } = useParams();
  const isNewThreadRoute = threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT;
  const selectedThreadId =
    isDefined(threadId) && isValidUuid(threadId) ? threadId : undefined;
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const { threads, isLoading } = useAgentChatInboxShownThreads();
  const { fetchMoreAgentChatInboxShownThreads } =
    useFetchMoreAgentChatInboxShownThreads();

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

  const [keyboardCursorThreadId, setKeyboardCursorThreadId] =
    useState(selectedThreadId);

  if (
    isDefined(selectedThreadId) &&
    selectedThreadId !== keyboardCursorThreadId
  ) {
    setKeyboardCursorThreadId(selectedThreadId);
  }

  const { navigateWithArrowKey } = useRecordSelectionArrowKeyNavigation({
    selectableItemsContainerRef: threadListContainerRef,
    activeRecordId: keyboardCursorThreadId,
    onActiveRecordChange: selectThread,
    onEndReached: fetchMoreAgentChatInboxShownThreads,
  });

  const handleThreadCheckboxClick = (
    { id }: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) =>
    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });

  const isSelectionShown = selectedRecordIds.length > 0;

  // Split view shows the list beside the chat or the selection; otherwise
  // the list and a chat each take the whole page
  const isListShown =
    isSplitView || (!isDefined(selectedThreadId) && !isNewThreadRoute);
  const isSelectionPaneShown = isSplitView && isSelectionShown;
  const isThreadShown = isDefined(selectedThreadId) && !isSelectionPaneShown;
  const isNewThreadShown = isNewThreadRoute && !isSelectionPaneShown;
  const isSecondaryPaneShown =
    isSelectionPaneShown || isThreadShown || isNewThreadShown;
  const isListFullWidth = !isSplitView || !isSecondaryPaneShown;
  const isSidePanelShowingAiChat =
    isSidePanelOpened &&
    isSidePanelItemShowingAiChat(sidePanelNavigationStack.at(-1));
  const shouldRenderConversationPane =
    !isSelectionPaneShown &&
    (isSecondaryPaneShown || !isSidePanelShowingAiChat);

  const openThreadIds =
    isDefined(selectedThreadId) && !isSelectionShown ? [selectedThreadId] : [];

  useGlobalHotkeys({
    keys: [
      Key.ArrowUp,
      Key.ArrowDown,
      ...(isListShown
        ? [`${Key.Shift}+${Key.ArrowUp}`, `${Key.Shift}+${Key.ArrowDown}`]
        : []),
    ],
    callback: navigateWithArrowKey,
    containsModifier: false,
    dependencies: [navigateWithArrowKey],
    options: { enableOnContentEditable: false, enableOnFormTags: false },
  });

  const backToInboxButton = (
    <IconButton
      size="sm"
      variant="outline"
      onClick={() => selectThread(null)}
      aria-label={t`Back to inbox`}
    >
      <IconChevronLeft />
    </IconButton>
  );

  const closeConversationButton = isSplitView && (
    <IconButton
      size="sm"
      variant="outline"
      onClick={() => selectThread(null)}
      aria-label={t`Close`}
    >
      <IconX />
    </IconButton>
  );

  const desktopThreadHeaderActions = isDefined(selectedThreadId) && (
    <>
      <AiChatInboxThreadPagination
        threads={threads}
        threadId={selectedThreadId}
        onThreadSelect={selectThread}
      />
      {closeConversationButton}
    </>
  );

  return (
    <StyledInbox>
      <AgentChatChannelThreadsLoadEffect />
      <RecordSelectionRecordIdsEffect records={threads} />
      <AiChatInboxSelectionEffect
        key={selectedThreadId}
        selectedThreadId={selectedThreadId}
        threads={threads}
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
          <StyledListPane
            $isFullWidth={isListFullWidth}
            role="region"
            aria-label={t`Conversation list`}
          >
            <PageCardLayout
              showInformationBanner={isListFullWidth}
              header={
                <AiChatInboxListHeader
                  selectedThreadCount={selectedRecordIds.length}
                  isSecondaryPaneShown={isSecondaryPaneShown}
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
                    {isLoading && threads.length === 0 ? (
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
                        selectedThreadIds={openThreadIds}
                        checkedThreadIds={selectedRecordIds}
                        onThreadClick={handleThreadClick}
                        onThreadCheckboxClick={handleThreadCheckboxClick}
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
        {isSelectionPaneShown && (
          <AiChatInboxSelectionPane
            selectedThreads={threads.filter(({ id }) =>
              selectedRecordIds.includes(id),
            )}
          />
        )}
      </AiChatInboxCommandMenuScope>
      {shouldRenderConversationPane && (
        <AnimatePresence initial={false}>
          {(isNewThreadShown || isThreadShown) && (
            <AiChatInboxConversationPane isSplitView={isSplitView}>
              {isNewThreadShown && (
                <>
                  <AiChatPageEffects />
                  <AiChatInboxNewThreadChannelEffect />
                  <AiChatNewThreadPageContent
                    showInformationBanner={!isSplitView}
                    headerActions={isMobile ? backToInboxButton : undefined}
                  />
                </>
              )}
              {isThreadShown && (
                <>
                  <AiChatPageEffects />
                  <AiChatThreadPageContent
                    threadId={selectedThreadId}
                    headerTitlePrefix={
                      !isSplitView && !isMobile && <AiChatInboxBreadcrumb />
                    }
                    headerActions={
                      isMobile ? backToInboxButton : desktopThreadHeaderActions
                    }
                  />
                </>
              )}
            </AiChatInboxConversationPane>
          )}
        </AnimatePresence>
      )}
    </StyledInbox>
  );
};

export const AiChatInboxPage = () => {
  // A new instance per visit, so a selection does not outlive the inbox
  const recordSelectionInstanceId = useAiChatInboxRecordSelectionInstanceId();
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
