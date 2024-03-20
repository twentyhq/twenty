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
