import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import { formatPagedObjectsToObjects } from '../utils/formatPagedObjectsToObjects';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

// TODO: test with a wrong name
// TODO: add zod to validate that we have at least id on each object
export const useFindManyObjects = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { foundMetadataObject, objectNotFoundInMetadata, findManyQuery } =
    useFindOneMetadataObject({
      objectNamePlural,
    });

  const { data, loading, error } = useQuery<PaginatedObjectType<ObjectType>>(
    findManyQuery,
    {
      skip: !foundMetadataObject,
    },
  );

  const objects = useMemo(
    () =>
      formatPagedObjectsToObjects({
        pagedObjects: data,
        objectNamePlural,
      }),
    [data, objectNamePlural],
  );

  return {
    objects,
    loading,
    error,
    objectNotFoundInMetadata,
  };
};
