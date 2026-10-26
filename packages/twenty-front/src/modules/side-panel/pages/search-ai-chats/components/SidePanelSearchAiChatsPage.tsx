import { isNonEmptyString } from '@sniptt/guards';

import { SidePanelAiChatPickerRecentChats } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRecentChats';
import { SidePanelAiChatPickerSearchResults } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSearchResults';
import { useAiChatThreadSearchTerm } from '@/side-panel/pages/search-ai-chats/hooks/useAiChatThreadSearchTerm';
import { useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';

export const SidePanelSearchAiChatsPage = () => {
  const { searchTerm, isSearchPending } = useAiChatThreadSearchTerm();
  const chatOpening = useOpenAiChatFromPicker();

  if (!isNonEmptyString(searchTerm)) {
    return (
      <SidePanelAiChatPickerRecentChats
        isSearchPending={isSearchPending}
        chatOpening={chatOpening}
      />
    );
  }

  return (
    <SidePanelAiChatPickerSearchResults
      key={searchTerm}
      searchTerm={searchTerm}
      isSearchPending={isSearchPending}
      chatOpening={chatOpening}
    />
  );
};
