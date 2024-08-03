import {
  useRecoilCallback,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';

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

  const resetSelectedItemIdState = useResetRecoilState(selectedItemIdState);

  const resetSelectedItem = () => {
    resetSelectedItemIdState();
  };

  const handleResetSelectedPosition = useRecoilCallback(
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

  return {
    selectableListId: scopeId,

    setSelectableItemIds,
    isSelectedItemIdSelector,
    setSelectableListOnEnter,
    resetSelectedItem,
    handleResetSelectedPosition,
  };
};
