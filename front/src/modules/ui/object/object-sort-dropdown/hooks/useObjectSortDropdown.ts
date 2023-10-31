import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { useScopeInternalContextOrThrow } from '../../../utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';
import { ObjectSortDropdownScopeInternalContext } from '../scopes/scope-internal-context/ObjectSortDropdownScopeInternalContext';

import { useObjectSortDropdownStates } from './useObjectSortDropdownStates';

type UseSortProps = {
  sortScopeId?: string;
};

export const useObjectSortDropdown = (props?: UseSortProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectSortDropdownScopeInternalContext,
    props?.sortScopeId,
  );
  const {
    availableSortDefinitions,
    setAvailableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
  } = useObjectSortDropdownStates(scopeId);

  const { onSortSelect } = useScopeInternalContextOrThrow(
    ObjectSortDropdownScopeInternalContext,
  );

  return {
    onSortSelect,
    scopeId,
    availableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
    setAvailableSortDefinitions,
  };
};
