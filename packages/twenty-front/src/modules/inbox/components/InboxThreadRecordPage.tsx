import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconX } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai-chat/constants/AiChatNewThreadPathSegment';
import { AiChatNewThreadPageContent } from '@/ai-chat/instance/components/AiChatNewThreadPageContent';
import { InboxConversationPane } from '@/inbox/components/InboxConversationPane';
import { InboxNewThreadListToggle } from '@/inbox/components/InboxNewThreadListToggle';
import { InboxThreadPageContent } from '@/inbox/components/InboxThreadPageContent';
import { InboxViewListPane } from '@/inbox/components/InboxViewListPane';
import { INBOX_LIST_PANE_WIDTH } from '@/inbox/constants/InboxListPaneWidth';
import { useIsInboxSplitView } from '@/inbox/hooks/useIsInboxSplitView';
import { useNavigateToInboxThread } from '@/inbox/hooks/useNavigateToInboxThread';

const StyledInboxThreadRecordPage = styled.div`
  --inbox-list-pane-width: ${INBOX_LIST_PANE_WIDTH}px;

  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

type InboxThreadRecordPageProps = {
  threadId: string;
};

export const InboxThreadRecordPage = ({
  threadId,
}: InboxThreadRecordPageProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isSplitView = useIsInboxSplitView();
  const { navigateToInboxThread } = useNavigateToInboxThread();

  const closeButton = (
    <IconButton
      size="sm"
      variant="outline"
      onClick={() => navigateToInboxThread({ threadId: null })}
      aria-label={isMobile ? t`Back to inbox` : t`Close`}
    >
      {isMobile ? <IconChevronLeft /> : <IconX />}
    </IconButton>
  );

  return (
    <StyledInboxThreadRecordPage>
      {isSplitView && <InboxViewListPane />}
      <InboxConversationPane isSplitView={isSplitView}>
        {threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? (
          <AiChatNewThreadPageContent
            headerIcon={<InboxNewThreadListToggle />}
            showInformationBanner={!isSplitView}
            headerActions={isMobile ? closeButton : undefined}
          />
        ) : (
          <InboxThreadPageContent
            threadId={threadId}
            headerActions={closeButton}
          />
        )}
      </InboxConversationPane>
    </StyledInboxThreadRecordPage>
  );
};
