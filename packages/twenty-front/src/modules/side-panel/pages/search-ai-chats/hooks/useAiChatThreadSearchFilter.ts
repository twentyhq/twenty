import { isNonEmptyString } from '@sniptt/guards';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { escapeForIlike } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS = 300;

export const useAiChatThreadSearchFilter = () => {
  const search = useAtomStateValue(sidePanelSearchState).trim();
  const [debouncedSearch] = useDebounce(
    search,
    CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS,
  );
  const filter: RecordGqlOperationFilter | undefined = isNonEmptyString(
    debouncedSearch,
  )
    ? { title: { ilike: `%${escapeForIlike(debouncedSearch)}%` } }
    : undefined;

  return { filter, isSearchPending: search !== debouncedSearch };
};
