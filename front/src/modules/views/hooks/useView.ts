import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useScopeInternalContextOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContextOrThrow';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewScopeId,
  );

  const { canPersistViewFields, onViewBarReset, ViewBarRecoilScopeContext } =
    useScopeInternalContextOrThrow(ViewScopeInternalContext);

  return {
    scopeId,
    canPersistViewFields,
    onViewBarReset,
    ViewBarRecoilScopeContext,
  };
};
