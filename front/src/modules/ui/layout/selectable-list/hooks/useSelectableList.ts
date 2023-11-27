import { useSetRecoilState } from 'recoil';

import { useSelectableListScopedStates } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListScopedStates';
import { SelectableListScopeInternalContext } from '@/ui/layout/selectable-list/scopes/scope-internal-context/SelectableListScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type UseSelectableListProps = {
  selectableListId?: string;
};

export const useSelectableList = (props?: UseSelectableListProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SelectableListScopeInternalContext,
    props?.selectableListId,
  );

  const { selectableItemIdsState } = useSelectableListScopedStates({
    selectableListScopeId: scopeId,
  });

  const setSelectableItemIds = useSetRecoilState(selectableItemIdsState);

  return {
    setSelectableItemIds,
    selectableListId: scopeId,
  };
};
