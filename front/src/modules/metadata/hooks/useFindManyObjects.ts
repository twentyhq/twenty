import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import { formatPagedObjectsToObjects } from '../utils/formatPagedObjectsToObjects';
import { generateFindManyCustomObjectsQuery } from '../utils/generateFindManyCustomObjectsQuery';

import { useFindOneMetadataObject } from './useFindOneMetadataObject';

// TODO: test with a wrong name
// TODO: add zod to validate that we have at least id on each object
export const useFindManyObjects = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { foundMetadataObject, objectNotFoundInMetadata } =
    useFindOneMetadataObject({
      objectNamePlural,
    });

  const generatedQuery = foundMetadataObject
    ? generateFindManyCustomObjectsQuery({
        metadataObject: foundMetadataObject,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const { data, loading, error } = useQuery<PaginatedObjectType<ObjectType>>(
    generatedQuery,
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
