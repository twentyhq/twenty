import { useContext } from 'react';

import { ObjectMetadataItemScopeInternalContext } from '../scopes/scope-internal-context/ObjectMetadataItemScopeInternalContext';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

export const useObjectMetadataItemInContext = () => {
  const context = useContext(ObjectMetadataItemScopeInternalContext);

  if (!context) {
    throw new Error(
      'Could not find ObjectMetadataItemScopeInternalContext while in useObjectMetadataItemInContext',
    );
  }

  const {
    foundObjectMetadataItem,
    loading,
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
  } = useFindOneObjectMetadataItem({
    objectNamePlural: context.objectNamePlural,
  });

  return {
    ...context,
    foundObjectMetadataItem,
    loading,
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
  };
};
