import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { type SearchResultItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Follows the selection immediately so the card never unmounts between
// records. Fetching is what gets debounced, one level down.
export const useSidePanelSearchRecordPreviewItem = (
  searchResultItems: SearchResultItem[],
): SearchResultItem | null => {
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  return searchResultItems.find((item) => item.id === selectedItemId) ?? null;
};
