import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';

import { PaginatedObjectType } from '../types/PaginatedObjectType';
import { formatPagedObjectsToObjects } from '../utils/formatPagedObjectsToObjects';
import { generateFindManyCustomObjectsQuery } from '../utils/generateFindManyCustomObjectsQuery';

import { useFindAllMetadata } from './useFindAllMetadata';

// TODO: test with a wrong name
// TODO: add zod to validate that we have at least id on each object
export const useFindManyCustomObjects = <ObjectType extends { id: string }>({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const { metadataObjects } = useFindAllMetadata();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  // eslint-disable-next-line no-console
  console.log({ metadataObjects, foundMetadataObject });

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

  // eslint-disable-next-line no-console
  console.log({ data, objects, loading, error });

  // TODO: waiting for cursor pagination to be implemented on backend
  // const hasMore = useMemo(() => {
  //   if (foundObject) {
  //     return data?.[foundObject.namePlural]?.pageInfo?.hasNextPage ?? false;
  //   }

  //   return false;
  // }, [data, foundObject]);

  // const fetchMore = ({ fromCursor }: { fromCursor: string }) => {
  //   fetchMoreInternal({
  //     variables: { fromCursor },
  //   });
  // };

  const objectNotFoundInMetadata =
    metadataObjects.length > 0 && !foundMetadataObject;

  return {
    objects,
    loading,
    error,
    objectNotFoundInMetadata,
  };
};
