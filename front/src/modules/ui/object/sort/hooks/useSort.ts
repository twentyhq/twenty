import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { SortScopeInternalContext } from '../scopes/scope-internal-context/SortScopeInternalContext';

import { useScopeInternalContextOrThrow } from './../../../utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';
import { useSortStates } from './useSortStates';

type UseSortProps = {
  sortScopeId?: string;
};

export const useSort = (props?: UseSortProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SortScopeInternalContext,
    props?.sortScopeId,
  );
  const {
    availableSortDefinitions,
    setAvailableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
  } = useSortStates(scopeId);

  const { onSortSelect } = useScopeInternalContextOrThrow(
    SortScopeInternalContext,
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
