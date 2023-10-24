import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopeInternalContextOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';

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

  const { availableSorts } = useScopeInternalContextOrThrow(
    SortScopeInternalContext,
  );

  if (!availableSorts) {
    throw new Error('availableSorts is not defined');
  }

  return {
    scopeId,
    sorts,
    setSorts,
    availableSorts,
  };
};
