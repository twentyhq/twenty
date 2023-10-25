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

  const { onSortAdd } = useScopeInternalContextOrThrow(
    SortScopeInternalContext,
  );

  const { availableSorts, setAvailableSorts } = useSortStates({
    scopeId,
  });

  return {
    onSortAdd,
    scopeId,
    availableSorts,
    setAvailableSorts,
  };
};
