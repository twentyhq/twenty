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
import { InboxBreadcrumb } from '@/ai/components/InboxBreadcrumb';
import { InboxCommandMenuScope } from '@/ai/components/InboxCommandMenuScope';
import { InboxConversationPane } from '@/ai/components/InboxConversationPane';
import { InboxListHeader } from '@/ai/components/InboxListHeader';
import { InboxNewThreadChannelEffect } from '@/ai/components/InboxNewThreadChannelEffect';
import { InboxSelectionEffect } from '@/ai/components/InboxSelectionEffect';
import { InboxSelectionPane } from '@/ai/components/InboxSelectionPane';
import { InboxSelectionToContextStoreEffect } from '@/ai/components/InboxSelectionToContextStoreEffect';
import { InboxPageThreadList } from '@/ai/components/InboxPageThreadList';
import { InboxThreadPagination } from '@/ai/components/InboxThreadPagination';
import { INBOX_LIST_PANE_WIDTH } from '@/ai/constants/InboxListPaneWidth';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useInboxRecordSelectionInstanceId } from '@/ai/hooks/useInboxRecordSelectionInstanceId';
import { useIsInboxShowingDirectMessage } from '@/ai/hooks/useIsInboxShowingDirectMessage';
import { useIsInboxSplitView } from '@/ai/hooks/useIsInboxSplitView';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { InboxThreadListFetchMoreTrigger } from '@/ai/components/InboxThreadListFetchMoreTrigger';
import { InboxThreadListLoadEffect } from '@/ai/components/InboxThreadListLoadEffect';
import { useInboxThreadList } from '@/ai/hooks/useInboxThreadList';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadInboxThreadList';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { inboxSelectedChannelViewSelector } from '@/ai/states/selectors/inboxSelectedChannelViewSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
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
  --inbox-list-pane-width: ${INBOX_LIST_PANE_WIDTH}px;

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

const InboxPageContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSplitView = useIsInboxSplitView();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const navigate = useNavigateApp();
  const { threadId } = useParams();
  const isNewThreadRoute = threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT;
  const selectedThreadId =
    isDefined(threadId) && isValidUuid(threadId) ? threadId : undefined;
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const isChannelHiddenForDirectMessage =
    useIsInboxShowingDirectMessage() && isDefined(inboxSelectedChannelView);
  const isSplitLayout = isSplitView && !isChannelHiddenForDirectMessage;
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const { threads, isLoading } = useInboxThreadList(
    inboxSelectedThreadListSource,
  );
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const fetchMoreShownThreads = () =>
    void loadInboxThreadList({
      source: inboxSelectedThreadListSource,
      mode: 'fetch-more',
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
    { id }: AiChatThreadRecord,
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
    onEndReached: fetchMoreShownThreads,
  });

  const handleThreadCheckboxClick = (
    { id }: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) =>
    toggleRecordSelection({ recordId: id, shouldSelectRange: event.shiftKey });

  const isSelectionShown = selectedRecordIds.length > 0;

  // Split view shows the list beside the chat or the selection; otherwise
  // the list and a chat each take the whole page
  const isListShown =
    isSplitLayout || (!isDefined(selectedThreadId) && !isNewThreadRoute);
  const isSelectionPaneShown = isSplitLayout && isSelectionShown;
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
      <InboxThreadPagination
        threads={threads}
        threadId={selectedThreadId}
        onThreadSelect={selectThread}
      />
      {closeConversationButton}
    </>
  );

  return (
    <StyledInbox>
      <InboxThreadListLoadEffect source={inboxSelectedThreadListSource} />
      <InboxNewThreadChannelEffect key={newAiChatThreadId} />
      <RecordSelectionRecordIdsEffect records={threads} />
      <InboxSelectionEffect
        key={selectedThreadId}
        selectedThreadId={selectedThreadId}
        threads={threads}
      />
      {/* The selection takes the place of the chat on screen, so the command
      menu acts on it */}
      {isSelectionShown && !isThreadShown && (
        <InboxSelectionToContextStoreEffect
          contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
        />
      )}
      <InboxCommandMenuScope>
        {isListShown && (
          <StyledListPane
            $isFullWidth={isListFullWidth}
            role="region"
            aria-label={t`Conversation list`}
          >
            <PageCardLayout
              showInformationBanner={isListFullWidth}
              header={
                <InboxListHeader
                  selectedThreadCount={selectedRecordIds.length}
                  isSecondaryPaneShown={isSecondaryPaneShown}
                />
              }
            >
              <StyledListContent>
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
                            {isDefined(inboxSelectedChannelView)
                              ? t`Conversations in this channel will appear here.`
                              : t`Conversations you can open will appear here.`}
                          </EmptyState.Description>
                        </EmptyState.Content>
                      </EmptyState.Root>
                    ) : (
                      <InboxPageThreadList
                        threads={threads}
                        selectedThreadIds={openThreadIds}
                        checkedThreadIds={selectedRecordIds}
                        onThreadClick={handleThreadClick}
                        onThreadCheckboxClick={handleThreadCheckboxClick}
                      />
                    )}
                    <InboxThreadListFetchMoreTrigger
                      key={getInboxThreadListSourceKey(
                        inboxSelectedThreadListSource,
                      )}
                      source={inboxSelectedThreadListSource}
                    />
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
          <InboxSelectionPane
            selectedThreads={threads.filter(({ id }) =>
              selectedRecordIds.includes(id),
            )}
          />
        )}
      </InboxCommandMenuScope>
      {shouldRenderConversationPane && (
        <AnimatePresence initial={false}>
          {(isNewThreadShown || isThreadShown) && (
            <InboxConversationPane isSplitView={isSplitLayout}>
              {isNewThreadShown && (
                <>
                  <AiChatPageEffects />
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
                      !isSplitView &&
                      !isMobile &&
                      !isChannelHiddenForDirectMessage && <InboxBreadcrumb />
                    }
                    headerActions={
                      isMobile ? backToInboxButton : desktopThreadHeaderActions
                    }
                  />
                </>
              )}
            </InboxConversationPane>
          )}
        </AnimatePresence>
      )}
    </StyledInbox>
  );
};

export const InboxPage = () => {
  // A new instance per visit, so a selection does not outlive the inbox
  const recordSelectionInstanceId = useInboxRecordSelectionInstanceId();
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
      <InboxPageContent />
    </RecordSelectionComponentInstanceContext.Provider>
  );
};
