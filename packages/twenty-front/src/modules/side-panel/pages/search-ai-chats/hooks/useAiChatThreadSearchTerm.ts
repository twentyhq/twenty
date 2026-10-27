import { useDebounce } from 'use-debounce';

import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS = 300;

export const useAiChatThreadSearchTerm = () => {
  const search = useAtomStateValue(sidePanelSearchState).trim();
  const [searchTerm] = useDebounce(
    search,
    CHAT_PICKER_SEARCH_DEBOUNCE_DELAY_IN_MS,
  );

  return { searchTerm };
};
