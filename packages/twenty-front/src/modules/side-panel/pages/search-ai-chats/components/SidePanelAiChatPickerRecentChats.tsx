import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useAgentChatThreadList } from '@/ai/hooks/useAgentChatThreadList';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { SidePanelAiChatPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerLoadMoreFooter';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelAiChatPickerRecentChatsProps = {
  isSearchPending: boolean;
};

export const SidePanelAiChatPickerRecentChats = ({
  isSearchPending,
}: SidePanelAiChatPickerRecentChatsProps) => {
  const { t } = useLingui();
  const { threads, agentChatThreadList, isLoading } = useAgentChatThreadList(
    AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
  );
  const aiChatPickerOpeningThreadId = useAtomComponentStateValue(
    aiChatPickerOpeningThreadIdComponentState,
  );
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const hasNextPage = agentChatThreadList?.hasNextPage ?? false;

  const handleLoadMore = async () => {
    setIsLoadingMoreChats(true);

    try {
      await loadAgentChatThreadList({
        source: AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
        mode: 'fetch-more',
      });
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  return (
    <SidePanelAiChatPickerList
      threads={threads}
      isLoading={isSearchPending || isLoading}
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
