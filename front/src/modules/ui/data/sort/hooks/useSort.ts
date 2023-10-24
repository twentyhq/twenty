import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { SortScopeInternalContext } from '../scopes/scope-internal-context/SortScopeInternalContext';

import { useSortStates } from './useSortStates';

type UseSortProps = {
  sortScopeId?: string;
};

export const useSort = (props?: UseSortProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SortScopeInternalContext,
    props?.sortScopeId,
  );

  const { sorts, setSorts, availableSorts, setAvailableSorts } = useSortStates({
    scopeId,
  });

  return {
    scopeId,
    sorts,
    setSorts,
    availableSorts,
    setAvailableSorts,
  };
};
