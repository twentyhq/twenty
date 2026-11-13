import { isNonEmptyString } from '@sniptt/guards';

import { SidePanelAiChatPickerRecentChats } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRecentChats';
import { SidePanelAiChatPickerSearchResults } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSearchResults';
import { useAiChatThreadSearchTerm } from '@/side-panel/pages/search-ai-chats/hooks/useAiChatThreadSearchTerm';
import { useIsAiChatThreadSearchPending } from '@/side-panel/pages/search-ai-chats/hooks/useIsAiChatThreadSearchPending';

export const SidePanelSearchAiChatsPage = () => {
  const { searchTerm } = useAiChatThreadSearchTerm();
  const isSearchPending = useIsAiChatThreadSearchPending(searchTerm);

  if (!isNonEmptyString(searchTerm)) {
    return (
      <SidePanelAiChatPickerRecentChats isSearchPending={isSearchPending} />
    );
  }

  return (
    <SidePanelAiChatPickerSearchResults
      key={searchTerm}
      searchTerm={searchTerm}
      isSearchPending={isSearchPending}
    />
  );
};
