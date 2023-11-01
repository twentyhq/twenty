import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ObjectMetadataItemScopeInternalContext } from '../scopes/scope-internal-context/ObjectMetadataItemScopeInternalContext';

type UseObjectMetadataItemProps = {
  objectMetadataItemNamePlural?: string;
};

export const useObjectMetadataItem = (props?: UseObjectMetadataItemProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ObjectMetadataItemScopeInternalContext,
    props?.objectMetadataItemNamePlural,
  );

  return {
    scopeId,
  };
};
