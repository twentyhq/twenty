import { type SearchResultItem } from '@/search/types/SearchResultItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Follows the selection immediately so the card never unmounts between
// records. Fetching is what gets debounced, one level down.
export const useSearchRecordPreviewItem = (
  searchResultItems: SearchResultItem[],
  selectableListInstanceId: string,
): SearchResultItem | null => {
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    selectableListInstanceId,
  );

  return searchResultItems.find((item) => item.id === selectedItemId) ?? null;
};
