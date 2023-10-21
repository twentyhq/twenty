import { useContext } from 'react';

import { MetadataObjectScopeInternalContext } from '../scopes/scope-internal-context/MetadataObjectScopeInternalContext';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

export const useMetadataObjectInContext = () => {
  const context = useContext(MetadataObjectScopeInternalContext);

  if (!context) {
    throw new Error(
      'Could not find MetadataObjectScopeInternalContext while in useMetadataObjectInContext',
    );
  }

  const { foundMetadataObject, loading, columnDefinitions } =
    useFindOneMetadataObject({
      objectNamePlural: context.objectNamePlural,
    });

  return {
    ...context,
    foundMetadataObject,
    loading,
    columnDefinitions,
  };
};
