import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordOptimisticEffectDefinition } from '@/object-record/graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreObjectsFamilyState } from '../states/isFetchingMoreObjectsFamilyState';
import { PaginatedObjectType } from '../types/PaginatedObjectType';
import {
  PaginatedObjectTypeEdge,
  PaginatedObjectTypeResults,
} from '../types/PaginatedObjectTypeResults';
import { mapPaginatedObjectsToObjects } from '../utils/mapPaginatedObjectsToObjects';

// TODO: test with a wrong name
// TODO: add zod to validate that we have at least id on each object
export const useFindManyObjectRecords = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNamePlural,
  filter,
  orderBy,
  limit = DEFAULT_SEARCH_REQUEST_LIMIT,
  onCompleted,
  skip,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'> & {
  filter?: any;
  orderBy?: any;
  limit?: number;
  onCompleted?: (data: PaginatedObjectTypeResults<ObjectType>) => void;
  skip?: boolean;
}) => {
  const findManyQueryStateIdentifier =
    objectNamePlural + JSON.stringify(filter) + JSON.stringify(orderBy) + limit;

  const [lastCursor, setLastCursor] = useRecoilState(
    cursorFamilyState(findManyQueryStateIdentifier),
  );

  const [hasNextPage, setHasNextPage] = useRecoilState(
    hasNextPageFamilyState(findManyQueryStateIdentifier),
  );

  const [, setIsFetchingMoreObjects] = useRecoilState(
    isFetchingMoreObjectsFamilyState(findManyQueryStateIdentifier),
  );

  const { objectMetadataItem, objectNotFoundInMetadata, findManyQuery } =
    useObjectMetadataItem({
      objectNamePlural,
    });

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular: objectMetadataItem?.nameSingular,
  });

  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error, fetchMore } = useQuery<
    PaginatedObjectType<ObjectType>
  >(findManyQuery, {
    skip: skip || !objectMetadataItem || !objectNamePlural,
    variables: {
      filter: filter ?? {},
      limit: limit,
      orderBy: orderBy ?? {},
    },
    onCompleted: (data) => {
      if (objectMetadataItem) {
        registerOptimisticEffect({
          variables: {
            filter: filter ?? {},
            orderBy: orderBy ?? {},
            limit: limit,
          },
          definition: getRecordOptimisticEffectDefinition({
            objectMetadataItem,
          }),
        });
      }

      if (objectNamePlural) {
        onCompleted?.(data[objectNamePlural]);

        if (objectNamePlural && data?.[objectNamePlural]) {
          setLastCursor(data?.[objectNamePlural]?.pageInfo.endCursor);
          setHasNextPage(data?.[objectNamePlural]?.pageInfo.hasNextPage);
        }
      }
    },
    onError: (error) => {
      logError(
        `useFindManyObjectRecords for "${objectNamePlural}" error : ` + error,
      );
      enqueueSnackBar(
        `Error during useFindManyObjectRecords for "${objectNamePlural}", ${error.message}`,
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
                  objectMetadataItem?.nameSingular ?? '',
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
    objectMetadataItem,
    hasNextPage,
    setIsFetchingMoreObjects,
    enqueueSnackBar,
  ]);

  const objects = useMemo(
    () =>
      objectNamePlural
        ? mapPaginatedObjectsToObjects({
            pagedObjects: data,
            objectNamePlural,
          })
        : [],
    [data, objectNamePlural],
  );

  return {
    objectMetadataItem,
    objects,
    loading,
    error,
    objectNotFoundInMetadata,
    fetchMoreObjects,
  };
};
