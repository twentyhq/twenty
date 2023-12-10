import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getRecordOptimisticEffectDefinition } from '@/object-record/graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreRecordsFamilyState } from '../states/isFetchingMoreRecordsFamilyState';
import { PaginatedRecordType } from '../types/PaginatedRecordType';
import {
  PaginatedRecordTypeEdge,
  PaginatedRecordTypeResults,
} from '../types/PaginatedRecordTypeResults';
import { mapPaginatedRecordsToRecords } from '../utils/mapPaginatedRecordsToRecords';

export const useFindManyRecords = <
  RecordType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  filter,
  orderBy,
  limit = DEFAULT_SEARCH_REQUEST_LIMIT,
  onCompleted,
  skip,
}: ObjectMetadataItemIdentifier & {
  filter?: any;
  orderBy?: OrderByField;
  limit?: number;
  onCompleted?: (data: PaginatedRecordTypeResults<RecordType>) => void;
  skip?: boolean;
}) => {
  const findManyQueryStateIdentifier =
    objectNameSingular +
    JSON.stringify(filter) +
    JSON.stringify(orderBy) +
    limit;

  const [lastCursor, setLastCursor] = useRecoilState(
    cursorFamilyState(findManyQueryStateIdentifier),
  );

  const [hasNextPage, setHasNextPage] = useRecoilState(
    hasNextPageFamilyState(findManyQueryStateIdentifier),
  );

  const setIsFetchingMoreObjects = useSetRecoilState(
    isFetchingMoreRecordsFamilyState(findManyQueryStateIdentifier),
  );

  const { objectMetadataItem, findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular,
  });

  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, error, fetchMore } = useQuery<
    PaginatedRecordType<RecordType>
  >(findManyRecordsQuery, {
    skip: skip || !objectMetadataItem || !currentWorkspace,
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

      onCompleted?.(data[objectMetadataItem.namePlural]);

      if (data?.[objectMetadataItem.namePlural]) {
        setLastCursor(
          data?.[objectMetadataItem.namePlural]?.pageInfo.endCursor,
        );
        setHasNextPage(
          data?.[objectMetadataItem.namePlural]?.pageInfo.hasNextPage,
        );
      }
    },
    onError: (error) => {
      logError(
        `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
          error,
      );
      enqueueSnackBar(
        `Error during useFindManyRecords for "${objectMetadataItem.namePlural}", ${error.message}`,
        {
          variant: 'error',
        },
      );
    },
  });

  const fetchMoreRecords = useCallback(async () => {
    if (hasNextPage) {
      setIsFetchingMoreObjects(true);

      try {
        await fetchMore({
          variables: {
            filter: filter ?? {},
            orderBy: orderBy ?? {},
            lastCursor: isNonEmptyString(lastCursor) ? lastCursor : undefined,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const previousEdges = prev?.[objectMetadataItem.namePlural]?.edges;
            const nextEdges =
              fetchMoreResult?.[objectMetadataItem.namePlural]?.edges;

            let newEdges: PaginatedRecordTypeEdge<RecordType>[] = [];

            if (isNonEmptyArray(previousEdges) && isNonEmptyArray(nextEdges)) {
              newEdges = filterUniqueRecordEdgesByCursor([
                ...prev?.[objectMetadataItem.namePlural]?.edges,
                ...fetchMoreResult?.[objectMetadataItem.namePlural]?.edges,
              ]);
            }

            if (data?.[objectMetadataItem.namePlural]) {
              setLastCursor(
                fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo
                  .endCursor,
              );
              setHasNextPage(
                fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo
                  .hasNextPage,
              );
            }

            onCompleted?.({
              __typename: `${capitalize(
                objectMetadataItem.nameSingular,
              )}Connection`,
              edges: newEdges,
              pageInfo:
                fetchMoreResult?.[objectMetadataItem.namePlural].pageInfo,
            });

            return Object.assign({}, prev, {
              [objectMetadataItem.namePlural]: {
                __typename: `${capitalize(
                  objectMetadataItem.nameSingular,
                )}Connection`,
                edges: newEdges,
                pageInfo:
                  fetchMoreResult?.[objectMetadataItem.namePlural].pageInfo,
              },
            } as PaginatedRecordType<RecordType>);
          },
        });
      } catch (error) {
        logError(
          `fetchMoreObjects for "${objectMetadataItem.namePlural}" error : ` +
            error,
        );
        enqueueSnackBar(
          `Error during fetchMoreObjects for "${objectMetadataItem.namePlural}", ${error}`,
          {
            variant: 'error',
          },
        );
      } finally {
        setIsFetchingMoreObjects(false);
      }
    }
  }, [
    hasNextPage,
    setIsFetchingMoreObjects,
    fetchMore,
    filter,
    orderBy,
    lastCursor,
    objectMetadataItem.namePlural,
    objectMetadataItem.nameSingular,
    onCompleted,
    data,
    setLastCursor,
    setHasNextPage,
    enqueueSnackBar,
  ]);

  const records = useMemo(
    () =>
      mapPaginatedRecordsToRecords({
        pagedRecords: data,
        objectNamePlural: objectMetadataItem.namePlural,
      }),
    [data, objectMetadataItem],
  );

  return {
    objectMetadataItem,
    records: records as RecordType[],
    loading,
    error,
    fetchMoreRecords,
    queryStateIdentifier: findManyQueryStateIdentifier,
  };
};
