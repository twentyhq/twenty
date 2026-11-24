import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNull } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDefaultSelectionEffect = ({
  selectableItemIds,
  defaultSelectedItemId,
}: {
  selectableItemIds: string[];
  defaultSelectedItemId?: string | null;
}) => {
  const { resetSelectedItem, setSelectedItemId } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const hasUserSelectedSidePanelListItem = useAtomStateValue(
    hasUserSelectedSidePanelListItemState,
  );

  useEffect(() => {
    if (
      isDefined(selectedItemId) &&
      selectableItemIds.includes(selectedItemId) &&
      hasUserSelectedSidePanelListItem
    ) {
      return;
    }

    if (isNull(defaultSelectedItemId)) {
      resetSelectedItem();
      return;
    }

    const itemIdToSelect =
      isDefined(defaultSelectedItemId) &&
      selectableItemIds.includes(defaultSelectedItemId)
        ? defaultSelectedItemId
        : selectableItemIds[0];

    if (isDefined(itemIdToSelect)) {
      setSelectedItemId(itemIdToSelect);
    }
  }, [
    defaultSelectedItemId,
    hasUserSelectedSidePanelListItem,
    resetSelectedItem,
    selectableItemIds,
    selectedItemId,
    setSelectedItemId,
  ]);

  return null;
};
