import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { MetadataObjectScopeInternalContext } from '../scopes/scope-internal-context/MetadataObjectScopeInternalContext';

type UseMetadataObjectProps = {
  metadataObjectNamePlural?: string;
};

export const useMetadataObject = (props?: UseMetadataObjectProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    MetadataObjectScopeInternalContext,
    props?.metadataObjectNamePlural,
  );

  return {
    scopeId,
  };
};
