import { isNonEmptyString } from '@sniptt/guards';

import { SidePanelInboxPickerRecentChats } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRecentChats';
import { SidePanelInboxPickerSearchResults } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSearchResults';
import { useInboxThreadSearchTerm } from '@/side-panel/pages/search-ai-chats/hooks/useAiChatThreadSearchTerm';
import { useIsInboxThreadSearchPending } from '@/side-panel/pages/search-ai-chats/hooks/useIsAiChatThreadSearchPending';

export const SidePanelSearchInboxsPage = () => {
  const { searchTerm } = useInboxThreadSearchTerm();
  const isSearchPending = useIsInboxThreadSearchPending(searchTerm);

  if (!isNonEmptyString(searchTerm)) {
    return (
      <SidePanelInboxPickerRecentChats isSearchPending={isSearchPending} />
    );
  }

  return (
    <SidePanelInboxPickerSearchResults
      key={searchTerm}
      searchTerm={searchTerm}
      isSearchPending={isSearchPending}
    />
  );
};
