import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useInboxThreadList } from '@/ai/hooks/useAgentChatThreadList';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { SidePanelInboxPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { SidePanelInboxPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerLoadMoreFooter';
import { inboxPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelInboxPickerRecentChatsProps = {
  isSearchPending: boolean;
};

export const SidePanelInboxPickerRecentChats = ({
  isSearchPending,
}: SidePanelInboxPickerRecentChatsProps) => {
  const { t } = useLingui();
  const { threads, inboxThreadList, isLoading } = useInboxThreadList(
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const inboxPickerOpeningThreadId = useAtomComponentStateValue(
    inboxPickerOpeningThreadIdComponentState,
  );
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const hasNextPage = inboxThreadList?.hasNextPage ?? false;

  const handleLoadMore = async () => {
    setIsLoadingMoreChats(true);

    try {
      await loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'fetch-more',
      });
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  return (
    <SidePanelInboxPickerList
      threads={threads}
      isLoading={isSearchPending || isLoading}
      loadingLabel={
        isSearchPending ? t`Searching chats...` : t`Loading chats...`
      }
      noResultsText={t`No chats yet`}
      footer={
        hasNextPage ? (
          <SidePanelInboxPickerLoadMoreFooter
            isLoadingMore={isLoadingMoreChats}
          >
            <Button
              fullWidth
              variant="ghost"
              disabled={isDefined(inboxPickerOpeningThreadId)}
              onClick={() => void handleLoadMore()}
            >
              {t`Load more chats`}
            </Button>
          </SidePanelInboxPickerLoadMoreFooter>
        ) : undefined
      }
    />
  );
};
