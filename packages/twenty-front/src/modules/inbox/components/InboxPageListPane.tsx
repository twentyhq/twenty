import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { InboxListHeader } from '@/inbox/components/InboxListHeader';
import { InboxPageThreadList } from '@/inbox/components/InboxPageThreadList';
import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { useInboxThreadListClickHandlers } from '@/inbox/hooks/useInboxThreadListClickHandlers';
import { useNavigateToInboxThread } from '@/inbox/hooks/useNavigateToInboxThread';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

type InboxPageListPaneProps = {
  threads: AiChatThreadRecord[];
  isLoading: boolean;
  isFullWidth: boolean;
  isSecondaryPaneShown: boolean;
  selectedThreadId: string | undefined;
  threadListContainerRef: RefObject<HTMLDivElement | null>;
};

export const InboxPageListPane = ({
  threads,
  isLoading,
  isFullWidth,
  isSecondaryPaneShown,
  selectedThreadId,
  threadListContainerRef,
}: InboxPageListPaneProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const { navigateToInboxThread } = useNavigateToInboxThread();
  const { handleThreadClick, handleThreadCheckboxClick } =
    useInboxThreadListClickHandlers({
      threads,
      selectedThreadId,
      selectThread: (threadId) => navigateToInboxThread({ threadId }),
    });
  const openThreadIds =
    isDefined(selectedThreadId) && selectedRecordIds.length === 0
      ? [selectedThreadId]
      : [];

  return (
    <StyledListPane
      $isFullWidth={isFullWidth}
      role="region"
      aria-label={t`Conversation list`}
    >
      <PageCardLayout
        showInformationBanner={isFullWidth}
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
                key={getInboxThreadListSourceKey(inboxSelectedThreadListSource)}
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
  );
};
