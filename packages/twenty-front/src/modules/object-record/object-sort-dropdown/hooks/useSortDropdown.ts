import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useSortDropdownStates } from '@/object-record/object-sort-dropdown/hooks/useSortDropdownStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ObjectSortDropdownScopeInternalContext } from '../scopes/scope-internal-context/ObjectSortDropdownScopeInternalContext';

type UseSortProps = {
  sortDropdownId?: string;
};

export const useSortDropdown = (props?: UseSortProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectSortDropdownScopeInternalContext,
    props?.sortDropdownId,
  );

  const {
    isSortSelectedState,
    onSortSelectState,
    objectSortDropdownSearchInputState,
  } = useSortDropdownStates(scopeId);

  const setObjectSortDropdownSearchInput = useSetRecoilState(
    objectSortDropdownSearchInputState,
  );

  const resetSearchInput = useRecoilCallback(
    ({ set }) =>
      () => {
        set(objectSortDropdownSearchInputState, '');
      },
    [objectSortDropdownSearchInputState],
  );

  return {
    scopeId,
    isSortSelectedState,
    onSortSelectState,
    objectSortDropdownSearchInputState,
    setObjectSortDropdownSearchInput,
    resetSearchInput,
  };
};
