import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsInboxThreadSearchPending = (searchTerm: string) => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  return sidePanelSearch.trim() !== searchTerm;
};
