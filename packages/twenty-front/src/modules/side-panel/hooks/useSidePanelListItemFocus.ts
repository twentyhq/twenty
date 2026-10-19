import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSelectableListNativeItemRef } from '@/ui/layout/selectable-list/hooks/useSelectableListNativeItemRef';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSidePanelListItemFocus = (itemId: string) => {
  const nativeItemRef = useSelectableListNativeItemRef(itemId);
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    itemId,
  );
  const { setSelectedItemId } = useSelectableList();
  const setHasUserSelectedSidePanelListItem = useSetAtomState(
    hasUserSelectedSidePanelListItemState,
  );

  const handleFocus = () => {
    setSelectedItemId(itemId);
    setHasUserSelectedSidePanelListItem(true);
  };

  return { nativeItemRef, isSelectedItemId, handleFocus };
};
