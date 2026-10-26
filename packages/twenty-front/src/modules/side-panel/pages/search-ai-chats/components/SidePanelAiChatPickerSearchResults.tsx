import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { escapeForIlike, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { SidePanelAiChatPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerLoadMoreFooter';
import { AI_CHAT_PICKER_RECORD_GQL_FIELDS } from '@/side-panel/pages/search-ai-chats/constants/AiChatPickerRecordGqlFields';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type SidePanelAiChatPickerSearchResultsProps = {
  searchTerm: string;
  isSearchPending: boolean;
};

export const SidePanelAiChatPickerSearchResults = ({
  searchTerm,
  isSearchPending,
}: SidePanelAiChatPickerSearchResultsProps) => {
  const { t } = useLingui();
  const aiChatPickerOpeningThreadId = useAtomComponentStateValue(
    aiChatPickerOpeningThreadIdComponentState,
  );
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
      errorAction={
        isDefined(error) ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch().catch(() => undefined)}
          >
            {t`Retry search`}
          </Button>
        ) : undefined
      }
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
