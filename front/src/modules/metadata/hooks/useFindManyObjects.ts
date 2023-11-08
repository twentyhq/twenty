import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { logError } from '~/utils/logError';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import { PaginatedObjectTypeEdge } from '../types/PaginatedObjectTypeResults';
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
      console.log('on Completed', { data });
      if (objectNamePlural) {
        onCompleted?.(data[objectNamePlural]);

        console.log({ objectNamePlural, data });
        if (objectNamePlural && data?.[objectNamePlural]?.pageInfo.endCursor) {
          setLastCursor(data?.[objectNamePlural]?.pageInfo.endCursor);
        }
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

  const fetchMoreObjects = useCallback(async () => {
    console.log({ objectNamePlural, lastCursor });
    if (objectNamePlural) {
      const data = await fetchMore({
        variables: {
          filter: filter ?? {},
          orderBy: orderBy ?? {},
          lastCursor: isNonEmptyString(lastCursor) ? lastCursor : undefined,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const uniqueByCursor = (a: PaginatedObjectTypeEdge<ObjectType>[]) => {
            const seenCursors = new Set();

            return a.filter((item) => {
              const currentCursor = item.cursor;

              return seenCursors.has(currentCursor)
                ? false
                : seenCursors.add(currentCursor);
            });
          };

          return Object.assign({}, prev, {
            [objectNamePlural]: {
              edges: uniqueByCursor([
                ...prev?.[objectNamePlural].edges,
                ...fetchMoreResult?.[objectNamePlural]?.edges,
              ]),
              pageInfo: fetchMoreResult?.[objectNamePlural].pageInfo,
            },
          } as PaginatedObjectType<ObjectType>);
        },
      });

      // if (objectNamePlural && onCompleted) {
      //   onCompleted(data.data?.[objectNamePlural]);

      //   if (
      //     objectNamePlural &&
      //     data.data?.[objectNamePlural]?.pageInfo.endCursor
      //   ) {
      //     setLastCursor(data.data?.[objectNamePlural]?.pageInfo.endCursor);
      //   }
      // }
    }
  }, [
    objectNamePlural,
    lastCursor,
    fetchMore,
    filter,
    orderBy,
    // onCompleted,
    // setLastCursor,
  ]);

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
    fetchMoreObjects,
    // fetchMoreObjects,
  };
};
