import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDefaultSelectionEffect = ({
  selectableItemIds,
}: {
  selectableItemIds: string[];
}) => {
  const { setSelectedItemId } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );
  const scopedSelectableListId = useWorkspaceSurfaceScopedComponentInstanceId(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    scopedSelectableListId,
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

    if (selectableItemIds.length > 0) {
      setSelectedItemId(selectableItemIds[0]);
    }
  }, [
    hasUserSelectedSidePanelListItem,
    selectableItemIds,
    selectedItemId,
    setSelectedItemId,
  ]);

  return null;
};
