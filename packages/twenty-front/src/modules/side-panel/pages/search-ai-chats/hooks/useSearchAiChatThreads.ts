import { isNonEmptyString } from '@sniptt/guards';
import {
  CoreObjectNameSingular,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { escapeForIlike } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const CHAT_PICKER_RECORD_GQL_FIELDS = {
  id: true,
  title: true,
} satisfies RecordGqlFields;
const CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS = 300;

export const useSearchAiChatThreads = () => {
  const search = useAtomStateValue(sidePanelSearchState).trim();
  const [debouncedSearch] = useDebounce(
    search,
    CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS,
  );
  const isSearchPending = search !== debouncedSearch;
  const {
    records,
    loading,
    error,
    hasNextPage,
    fetchMoreRecords,
    queryIdentifier,
    refetch,
  } = useFindManyRecords<AgentChatThreadRecord>({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    recordGqlFields: CHAT_PICKER_RECORD_GQL_FIELDS,
    filter: isNonEmptyString(debouncedSearch)
      ? { title: { ilike: `%${escapeForIlike(debouncedSearch)}%` } }
      : undefined,
    orderBy: [{ lastActivityAt: 'DescNullsLast' }],
    fetchPolicy: 'network-only',
  });
  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );
  const isLoading = isSearchPending || (loading && !isFetchingMoreRecords);

  return {
    threads: isLoading ? [] : records,
    isLoading,
    isFetchingMore: isFetchingMoreRecords,
    hasNextPage: !isLoading && hasNextPage,
    error: isLoading ? undefined : error,
    fetchMoreRecords,
    refetch,
  };
};
