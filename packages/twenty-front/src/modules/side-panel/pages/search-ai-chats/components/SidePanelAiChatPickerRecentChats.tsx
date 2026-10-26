import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { type useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SidePanelAiChatPickerRecentChatsProps = {
  isSearchPending: boolean;
  chatOpening: ReturnType<typeof useOpenAiChatFromPicker>;
};

export const SidePanelAiChatPickerRecentChats = ({
  isSearchPending,
  chatOpening,
}: SidePanelAiChatPickerRecentChatsProps) => {
  const { t } = useLingui();
  const { threads, loading } = useChatThreads(agentChatRecentThreadsSelector);
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);

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
      hasNextPage={agentChatThreadList?.hasNextPage ?? false}
      isLoadingMore={isLoadingMoreChats}
      onLoadMore={() => void handleLoadMore()}
      chatOpening={chatOpening}
    />
  );
};
