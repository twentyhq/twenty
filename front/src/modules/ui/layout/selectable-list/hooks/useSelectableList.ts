import { useRecoilValue, useSetRecoilState } from 'recoil';

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
  } = useSelectableListScopedStates({
    selectableListScopeId: scopeId,
    itemId: props?.itemId,
  });

  const setSelectableItemIds = useSetRecoilState(selectableItemIdsState);
  const setSelectableListOnEnter = useSetRecoilState(
    selectableListOnEnterState,
  );
  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector);

  return {
    setSelectableItemIds,
    isSelectedItemId,
    setSelectableListOnEnter,
    selectableListId: scopeId,
    isSelectedItemIdSelector,
  };
};
