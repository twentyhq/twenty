import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';
import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type UseSelectableListProps = {
  selectableListId?: string;
  itemId?: string;
};

export const useSelectableList = (props?: UseSelectableListProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    props?.selectableListId,
  );

  const {
    selectableItemIdsState,
    isSelectedItemIdSelector,
    selectableListOnEnterState,
    selectedItemIdState,
  } = useSelectableListScopedStates({
    selectableListScopeId: scopeId,
    itemId: props?.itemId,
  });

  const setSelectableItemIds = useSetRecoilState(selectableItemIdsState);
  const setSelectableListOnEnter = useSetRecoilState(
    selectableListOnEnterState,
  );
  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector);

  const resetSelectedItemIdState = useResetRecoilState(selectedItemIdState);
  const resetIsSelectedItemIdSelector = useResetRecoilState(
    isSelectedItemIdSelector,
  );

  const resetSelectedItem = () => {
    resetSelectedItemIdState();
    resetIsSelectedItemIdSelector();
  };

  return {
    setSelectableItemIds,
    isSelectedItemId,
    setSelectableListOnEnter,
    selectableListId: scopeId,
    isSelectedItemIdSelector,
    resetSelectedItem,
  };
};
