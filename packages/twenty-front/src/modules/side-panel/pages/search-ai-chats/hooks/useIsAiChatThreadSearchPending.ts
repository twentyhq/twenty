import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsAiChatThreadSearchPending = (searchTerm: string) => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  return sidePanelSearch.trim() !== searchTerm;
};
