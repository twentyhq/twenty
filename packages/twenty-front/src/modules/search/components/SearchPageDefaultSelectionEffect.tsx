import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SEARCH_PAGE_SELECTABLE_LIST_ID } from '@/search/constants/SearchPageSelectableListId';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// The preview always mirrors a selected row, so a fresh result set falls back
// to its first item instead of leaving the preview column empty.
export const SearchPageDefaultSelectionEffect = ({
  selectableItemIds,
}: {
  selectableItemIds: string[];
}) => {
  const { setSelectedItemId } = useSelectableList(
    SEARCH_PAGE_SELECTABLE_LIST_ID,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    SEARCH_PAGE_SELECTABLE_LIST_ID,
  );

  useEffect(() => {
    if (
      isDefined(selectedItemId) &&
      selectableItemIds.includes(selectedItemId)
    ) {
      return;
    }

    if (selectableItemIds.length > 0) {
      setSelectedItemId(selectableItemIds[0]);
    }
  }, [selectableItemIds, selectedItemId, setSelectedItemId]);

  return null;
};
