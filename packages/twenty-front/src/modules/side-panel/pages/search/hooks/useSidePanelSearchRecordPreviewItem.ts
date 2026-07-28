import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { type SearchResultItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useDebounce } from 'use-debounce';

const SEARCH_RECORD_PREVIEW_DEBOUNCE_MS = 200;

// The preview fetches the highlighted record, so it lags behind the selection
// to avoid firing a query for every row crossed while navigating with arrows
export const useSidePanelSearchRecordPreviewItem = (
  searchResultItems: SearchResultItem[],
) => {
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const [debouncedSelectedItemId] = useDebounce(
    selectedItemId,
    SEARCH_RECORD_PREVIEW_DEBOUNCE_MS,
  );

  return (
    searchResultItems.find((item) => item.id === debouncedSelectedItemId) ??
    null
  );
};
