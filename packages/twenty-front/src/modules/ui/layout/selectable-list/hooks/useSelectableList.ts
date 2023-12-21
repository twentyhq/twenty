import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { useSelectableListScopedState } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedState';
import { getSelectableListScopeInjectors } from '@/ui/layout/selectable-list/utils/internal/getSelectableListScopeInjectors';

export const useSelectableList = (selectableListScopeId?: string) => {
  const {
    getSelectableListScopedState,
    getSelectableListScopedFamilyState,
    scopeId,
  } = useSelectableListScopedState({
    selectableListScopeId,
  });

  const {
    selectedItemIdScopeInjector,
    selectableItemIdsScopeInjector,
    selectableListOnEnterScopeInjector,
    isSelectedItemIdFamilyScopeInjector,
  } = getSelectableListScopeInjectors();

  const setSelectableItemIds = useSetRecoilState(
    getSelectableListScopedState(selectableItemIdsScopeInjector),
  );
  const setSelectableListOnEnter = useSetRecoilState(
    getSelectableListScopedState(selectableListOnEnterScopeInjector),
  );
  const isSelectedItemIdFamilyState = getSelectableListScopedFamilyState(
    isSelectedItemIdFamilyScopeInjector,
  );

  const resetSelectedItemIdState = useResetRecoilState(
    getSelectableListScopedState(selectedItemIdScopeInjector),
  );

  const resetSelectedItem = () => {
    resetSelectedItemIdState();
  };

  return {
    selectableListId: scopeId,

    setSelectableItemIds,
    isSelectedItemIdFamilyState,
    setSelectableListOnEnter,
    resetSelectedItem,
  };
};
