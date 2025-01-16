import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { isDefined } from '~/utils/isDefined';

export const useSelectableList = (selectableListId?: string) => {
  const {
    scopeId,
    selectableItemIdsState,
    selectableListOnEnterState,
    isSelectedItemIdSelector,
    selectedItemIdState,
  } = useSelectableListStates({
    selectableListScopeId: selectableListId,
  });

  const setSelectableItemIds = useSetRecoilState(selectableItemIdsState);
  const setSelectableListOnEnter = useSetRecoilState(
    selectableListOnEnterState,
  );

  const resetSelectedItem = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const selectedItemId = getSnapshotValue(snapshot, selectedItemIdState);

        if (isDefined(selectedItemId)) {
          set(selectedItemIdState, null);
          set(isSelectedItemIdSelector(selectedItemId), false);
        }
      },
    [selectedItemIdState, isSelectedItemIdSelector],
  );

  const setSelectedItemId = useRecoilCallback(
    ({ set, snapshot }) =>
      (itemId: string) => {
        const selectedItemId = getSnapshotValue(snapshot, selectedItemIdState);

        if (isDefined(selectedItemId)) {
          set(isSelectedItemIdSelector(selectedItemId), false);
        }

        set(selectedItemIdState, itemId);
        set(isSelectedItemIdSelector(itemId), true);
      },
    [selectedItemIdState, isSelectedItemIdSelector],
  );

  return {
    selectableListId: scopeId,
    setSelectableItemIds,
    isSelectedItemIdSelector,
    setSelectableListOnEnter,
    resetSelectedItem,
    setSelectedItemId,
    selectedItemIdState,
  };
};
