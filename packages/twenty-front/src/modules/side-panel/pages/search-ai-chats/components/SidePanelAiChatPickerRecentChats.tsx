import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { SidePanelAiChatPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerLoadMoreFooter';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SidePanelAiChatPickerRecentChatsProps = {
  isSearchPending: boolean;
};

export const SidePanelAiChatPickerRecentChats = ({
  isSearchPending,
}: SidePanelAiChatPickerRecentChatsProps) => {
  const { t } = useLingui();
  const { threads, loading } = useChatThreads(agentChatRecentThreadsSelector);
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const aiChatPickerOpeningThreadId = useAtomComponentStateValue(
    aiChatPickerOpeningThreadIdComponentState,
  );
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const hasNextPage = agentChatThreadList?.hasNextPage ?? false;

  const handleLoadMore = async () => {
    setIsLoadingMoreChats(true);

    try {
      await fetchMoreAgentChatThreads();
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  return (
    <SidePanelAiChatPickerList
      threads={threads}
      isLoading={isSearchPending || loading}
      loadingLabel={
        isSearchPending ? t`Searching chats...` : t`Loading chats...`
      }
      noResultsText={t`No chats yet`}
      footer={
        hasNextPage ? (
          <SidePanelAiChatPickerLoadMoreFooter
            isLoadingMore={isLoadingMoreChats}
          >
            <Button
              fullWidth
              variant="ghost"
              disabled={isDefined(aiChatPickerOpeningThreadId)}
              onClick={() => void handleLoadMore()}
            >
              {t`Load more chats`}
            </Button>
          </SidePanelAiChatPickerLoadMoreFooter>
        ) : undefined
      }
    />
  );
};
