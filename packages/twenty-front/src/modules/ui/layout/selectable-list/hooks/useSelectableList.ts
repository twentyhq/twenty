import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { useSelectableListStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListStates';

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

  return {
    selectableListId: scopeId,

    setSelectableItemIds,
    isSelectedItemIdSelector,
    setSelectableListOnEnter,
    resetSelectedItem,
  };
};
