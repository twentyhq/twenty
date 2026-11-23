import { styled } from '@linaria/react';
import { AnimatePresence } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconX } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxBreadcrumb } from '@/inbox/components/InboxBreadcrumb';
import { InboxCommandMenuScope } from '@/inbox/components/InboxCommandMenuScope';
import { InboxConversationPane } from '@/inbox/components/InboxConversationPane';
import { InboxPageListPane } from '@/inbox/components/InboxPageListPane';
import { InboxSelectionEffect } from '@/inbox/components/InboxSelectionEffect';
import { InboxSelectionPane } from '@/inbox/components/InboxSelectionPane';
import { InboxSelectionToContextStoreEffect } from '@/inbox/components/InboxSelectionToContextStoreEffect';
import { InboxThreadPagination } from '@/inbox/components/InboxThreadPagination';
import { INBOX_LIST_PANE_WIDTH } from '@/inbox/constants/InboxListPaneWidth';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai-chat/constants/AiChatNewThreadPathSegment';
import { useInboxRecordSelectionInstanceId } from '@/inbox/hooks/useInboxRecordSelectionInstanceId';
import { useInboxThreadListKeyboardNavigation } from '@/inbox/hooks/useInboxThreadListKeyboardNavigation';
import { useIsInboxShowingDirectMessage } from '@/inbox/hooks/useIsInboxShowingDirectMessage';
import { useIsInboxSplitView } from '@/inbox/hooks/useIsInboxSplitView';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { isSidePanelItemShowingAiChat } from '@/ai-chat/utils/isSidePanelItemShowingAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordSelectionRecordIdsEffect } from '@/object-record/record-selection/components/RecordSelectionRecordIdsEffect';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateToInboxThread } from '@/inbox/hooks/useNavigateToInboxThread';
import { AiChatNewThreadPageContent } from '@/ai-chat/instance/components/AiChatNewThreadPageContent';
import { InboxThreadPageContent } from '@/inbox/components/InboxThreadPageContent';
import { InboxNewThreadListToggle } from '@/inbox/components/InboxNewThreadListToggle';

const StyledInbox = styled.div`
  --inbox-list-pane-width: ${INBOX_LIST_PANE_WIDTH}px;

  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const InboxPageContent = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSplitView = useIsInboxSplitView();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
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
  const threadListContainerRef = useRef<HTMLDivElement>(null);

  const { navigateToInboxThread } = useNavigateToInboxThread();
  const selectThread = (nextThreadId: string | null) =>
    navigateToInboxThread({ threadId: nextThreadId });

  const isSelectionShown = selectedRecordIds.length > 0;

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

  useInboxThreadListKeyboardNavigation({
    threadListContainerRef,
    selectedThreadId,
    isListShown,
    selectThread,
    onEndReached: fetchMoreShownThreads,
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
      <RecordSelectionRecordIdsEffect records={threads} />
      <InboxSelectionEffect
        key={selectedThreadId}
        selectedThreadId={selectedThreadId}
        threads={threads}
      />
      {isSelectionShown && !isThreadShown && (
        <InboxSelectionToContextStoreEffect
          contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
        />
      )}
      <InboxCommandMenuScope>
        {isListShown && (
          <InboxPageListPane
            threads={threads}
            isLoading={isLoading}
            isFullWidth={isListFullWidth}
            isSecondaryPaneShown={isSecondaryPaneShown}
            selectedThreadId={selectedThreadId}
            threadListContainerRef={threadListContainerRef}
          />
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
                <AiChatNewThreadPageContent
                  headerIcon={<InboxNewThreadListToggle />}
                  showInformationBanner={!isSplitView}
                  headerActions={isMobile ? backToInboxButton : undefined}
                />
              )}
              {isThreadShown && (
                <InboxThreadPageContent
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
              )}
            </InboxConversationPane>
          )}
        </AnimatePresence>
      )}
    </StyledInbox>
  );
};

export const InboxPage = () => {
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
