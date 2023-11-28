import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ObjectSortDropdownScopeInternalContext } from '../scopes/scope-internal-context/ObjectSortDropdownScopeInternalContext';

import { useSortStates } from './useSortStates';

type UseSortProps = {
  sortScopeId?: string;
};

export const useSort = (props?: UseSortProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectSortDropdownScopeInternalContext,
    props?.sortScopeId,
  );
  const {
    availableSortDefinitions,
    setAvailableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
    onSortSelect,
    setOnSortSelect,
  } = useSortStates(scopeId);

  return {
    scopeId,
    availableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
    setAvailableSortDefinitions,
    onSortSelect,
    setOnSortSelect,
  };
};
