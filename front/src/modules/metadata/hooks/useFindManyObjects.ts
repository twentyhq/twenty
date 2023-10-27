import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';

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
}: Pick<MetadataObjectIdentifier, 'objectNamePlural'>) => {
  const { foundMetadataObject, objectNotFoundInMetadata, findManyQuery } =
    useFindOneMetadataObject({
      objectNamePlural,
    });

  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error } = useQuery<PaginatedObjectType<ObjectType>>(
    findManyQuery,
    {
      skip: !foundMetadataObject,
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error(
          `useFindManyObjects for "${objectNamePlural}" error : `,
          error,
        );
        enqueueSnackBar(
          `Error during useFindManyObjects for "${objectNamePlural}", ${error.message}`,
          {
            variant: 'error',
          },
        );
      },
    },
  );

  const objects = useMemo(
    () =>
      objectNamePlural
        ? formatPagedObjectsToObjects({
            pagedObjects: data,
            objectNamePlural,
          })
        : [],
    [data, objectNamePlural],
  );

  return {
    objects,
    loading,
    error,
    objectNotFoundInMetadata,
  };
};
