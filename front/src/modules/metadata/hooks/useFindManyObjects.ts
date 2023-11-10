import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState } from 'recoil';

import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreObjectsFamilyState } from '../states/isFetchingMoreObjectsFamilyState';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import {
  PaginatedObjectTypeEdge,
  PaginatedObjectTypeResults,
} from '../types/PaginatedObjectTypeResults';
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
  onCompleted?: (data: PaginatedObjectTypeResults<ObjectType>) => void;
  skip?: boolean;
}) => {
  const [lastCursor, setLastCursor] = useRecoilState(
    cursorFamilyState(objectNamePlural),
  );

  const [hasNextPage, setHasNextPage] = useRecoilState(
    hasNextPageFamilyState(objectNamePlural),
  );

  const [, setIsFetchingMoreObjects] = useRecoilState(
    isFetchingMoreObjectsFamilyState(objectNamePlural),
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
      if (objectNamePlural) {
        onCompleted?.(data[objectNamePlural]);

        if (objectNamePlural && data?.[objectNamePlural]) {
          setLastCursor(data?.[objectNamePlural]?.pageInfo.endCursor);
          setHasNextPage(data?.[objectNamePlural]?.pageInfo.hasNextPage);
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
    if (objectNamePlural && hasNextPage) {
      setIsFetchingMoreObjects(true);

      try {
        await fetchMore({
          variables: {
            filter: filter ?? {},
            orderBy: orderBy ?? {},
            lastCursor: isNonEmptyString(lastCursor) ? lastCursor : undefined,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const uniqueByCursor = (
              a: PaginatedObjectTypeEdge<ObjectType>[],
            ) => {
              const seenCursors = new Set();

              return a.filter((item) => {
                const currentCursor = item.cursor;

                return seenCursors.has(currentCursor)
                  ? false
                  : seenCursors.add(currentCursor);
              });
            };

            const previousEdges = prev?.[objectNamePlural]?.edges;
            const nextEdges = fetchMoreResult?.[objectNamePlural]?.edges;

            let newEdges: any[] = [];

            if (isNonEmptyArray(previousEdges) && isNonEmptyArray(nextEdges)) {
              newEdges = uniqueByCursor([
                ...prev?.[objectNamePlural]?.edges,
                ...fetchMoreResult?.[objectNamePlural]?.edges,
              ]);
            }

            return Object.assign({}, prev, {
              [objectNamePlural]: {
                __typename: `${capitalize(
                  foundObjectMetadataItem?.nameSingular ?? '',
                )}Connection`,
                edges: newEdges,
                pageInfo: fetchMoreResult?.[objectNamePlural].pageInfo,
              },
            } as PaginatedObjectType<ObjectType>);
          },
        });
      } catch (error) {
        logError(`fetchMoreObjects for "${objectNamePlural}" error : ` + error);
        enqueueSnackBar(
          `Error during fetchMoreObjects for "${objectNamePlural}", ${error}`,
          {
            variant: 'error',
          },
        );
      } finally {
        setIsFetchingMoreObjects(false);
      }
    }
  }, [
    objectNamePlural,
    lastCursor,
    fetchMore,
    filter,
    orderBy,
    foundObjectMetadataItem,
    hasNextPage,
    setIsFetchingMoreObjects,
    enqueueSnackBar,
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
  };
};
