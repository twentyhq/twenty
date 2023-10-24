import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { SortScopeInternalContext } from '../scopes/scope-internal-context/SortScopeInternalContext';

import { useSortStates } from './useSortStates';

type UseViewProps = {
  sortScopeId?: string;
};

export const useSortInternal = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SortScopeInternalContext,
    props?.sortScopeId,
  );

  const { sorts, setSorts } = useSortStates({
    scopeId,
  });

  return {
    scopeId,
    sorts,
    setSorts,
  };
};
