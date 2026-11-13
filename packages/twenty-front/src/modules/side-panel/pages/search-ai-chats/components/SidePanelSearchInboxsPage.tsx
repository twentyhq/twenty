import { isNonEmptyString } from '@sniptt/guards';

import { SidePanelInboxPickerRecentChats } from '@/side-panel/pages/search-ai-chats/components/SidePanelInboxPickerRecentChats';
import { SidePanelInboxPickerSearchResults } from '@/side-panel/pages/search-ai-chats/components/SidePanelInboxPickerSearchResults';
import { useInboxThreadSearchTerm } from '@/side-panel/pages/search-ai-chats/hooks/useInboxThreadSearchTerm';
import { useIsInboxThreadSearchPending } from '@/side-panel/pages/search-ai-chats/hooks/useIsInboxThreadSearchPending';

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
