import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { escapeForIlike, isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { AI_CHAT_PICKER_RECORD_GQL_FIELDS } from '@/side-panel/pages/search-ai-chats/constants/AiChatPickerRecordGqlFields';
import { type useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';

type SidePanelAiChatPickerSearchResultsProps = {
  searchTerm: string;
  isSearchPending: boolean;
  chatOpening: ReturnType<typeof useOpenAiChatFromPicker>;
};

export const SidePanelAiChatPickerSearchResults = ({
  searchTerm,
  isSearchPending,
  chatOpening,
}: SidePanelAiChatPickerSearchResultsProps) => {
  const { t } = useLingui();
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const { records, loading, hasNextPage, error, fetchMoreRecords, refetch } =
    useFindManyRecords<AgentChatThreadRecord>({
      objectNameSingular: CoreObjectNameSingular.AgentChatThread,
      recordGqlFields: AI_CHAT_PICKER_RECORD_GQL_FIELDS,
      filter: { title: { ilike: `%${escapeForIlike(searchTerm)}%` } },
      orderBy: [{ lastActivityAt: 'DescNullsLast' }],
      fetchPolicy: 'network-only',
    });

  const handleLoadMore = async () => {
    setIsLoadingMoreChats(true);

    try {
      await fetchMoreRecords();
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  return (
    <SidePanelAiChatPickerList
      threads={records}
      isLoading={isSearchPending || (loading && !isLoadingMoreChats)}
      loadingLabel={t`Searching chats...`}
      noResultsText={t`No chats match your search`}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoadingMoreChats}
      onLoadMore={() => void handleLoadMore()}
      hasError={isDefined(error)}
      onRetry={() => void refetch().catch(() => undefined)}
      chatOpening={chatOpening}
    />
  );
};
