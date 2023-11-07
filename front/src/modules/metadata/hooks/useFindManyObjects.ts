import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { logError } from '~/utils/logError';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import { formatPagedObjectsToObjects } from '../utils/formatPagedObjectsToObjects';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

// TODO: test with a wrong name
// TODO: add zod to validate that we have at least id on each object
export const useFindManyObjects = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNamePlural,
  filter,
  orderBy,
  onCompleted,
  skip,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'> & {
  filter?: any;
  orderBy?: any;
  onCompleted?: (data: any) => void;
  skip?: boolean;
}) => {
  const [lastCursor, setLastCursor] = useRecoilState(
    cursorFamilyState(objectNamePlural),
  );

  const { foundObjectMetadataItem, objectNotFoundInMetadata, findManyQuery } =
    useFindOneObjectMetadataItem({
      objectNamePlural,
      skip,
    });

  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error, fetchMore } = useQuery<
    PaginatedObjectType<ObjectType>
  >(findManyQuery, {
    skip: skip || !foundObjectMetadataItem || !objectNamePlural,
    variables: {
      filter: filter ?? {},
      orderBy: orderBy ?? {},
    },
    onCompleted: (data) => {
      if (objectNamePlural && onCompleted) {
        onCompleted(data[objectNamePlural]);
      }
    },
    onError: (error) => {
      logError(`useFindManyObjects for "${objectNamePlural}" error : ` + error);
      enqueueSnackBar(
        `Error during useFindManyObjects for "${objectNamePlural}", ${error.message}`,
        {
          variant: 'error',
        },
      );
    },
  });

  useEffect(() => {
    if (objectNamePlural && data?.[objectNamePlural]?.pageInfo.endCursor) {
      setLastCursor(data?.[objectNamePlural]?.pageInfo.endCursor);
    }
  }, [objectNamePlural, data, setLastCursor]);

  // const fetchMoreObjects = useCallback(() => {
  //   if (objectNamePlural && lastCursor) {
  //     fetchMore({
  //       variables: {
  //         filter: filter ?? {},
  //         orderBy: orderBy ?? {},
  //         lastCursor: lastCursor,
  //       },
  //     });
  //   }
  // }, [objectNamePlural, lastCursor, fetchMore, filter, orderBy]);

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
    fetchMore,
    // fetchMoreObjects,
  };
};
