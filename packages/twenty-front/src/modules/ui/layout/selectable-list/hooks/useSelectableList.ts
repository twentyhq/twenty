import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { useSelectableListScopedState } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedState';
import { getSelectableListScopeInjectors } from '@/ui/layout/selectable-list/utils/internal/getSelectableListScopeInjectors';

export const useSelectableList = (selectableListId?: string) => {
  const {
    injectStateWithSelectableListScopeId,
    injectFamilyStateWithSelectableListScopeId,
    scopeId,
  } = useSelectableListScopedState({
    selectableListScopeId: selectableListId,
  });

  const {
    selectedItemIdScopeInjector,
    selectableItemIdsScopeInjector,
    selectableListOnEnterScopeInjector,
    isSelectedItemIdFamilyScopeInjector,
  } = getSelectableListScopeInjectors();

  const setSelectableItemIds = useSetRecoilState(
    injectStateWithSelectableListScopeId(selectableItemIdsScopeInjector),
  );
  const setSelectableListOnEnter = useSetRecoilState(
    injectStateWithSelectableListScopeId(selectableListOnEnterScopeInjector),
  );
  const isSelectedItemIdFamilyState =
    injectFamilyStateWithSelectableListScopeId(
      isSelectedItemIdFamilyScopeInjector,
    );

  const resetSelectedItemIdState = useResetRecoilState(
    injectStateWithSelectableListScopeId(selectedItemIdScopeInjector),
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
