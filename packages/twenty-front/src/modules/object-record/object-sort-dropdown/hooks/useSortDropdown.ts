import { useAvailableScopeIdOrThrow } from 'twenty-ui';

import { useSortDropdownStates } from '@/object-record/object-sort-dropdown/hooks/useSortDropdownStates';

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
    availableSortDefinitionsState,
    isSortSelectedState,
    onSortSelectState,
  } = useSortDropdownStates(scopeId);

  return {
    scopeId,
    availableSortDefinitionsState,
    isSortSelectedState,
    onSortSelectState,
  };
};
