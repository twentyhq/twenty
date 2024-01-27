import { useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useMapConnectionToRecords } from '@/object-record/hooks/useMapConnectionToRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreRecordsFamilyState } from '../states/isFetchingMoreRecordsFamilyState';
import { ObjectRecordQueryResult } from '../types/ObjectRecordQueryResult';
import { mapPaginatedRecordsToRecords } from '../utils/mapPaginatedRecordsToRecords';

export const useFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit = DEFAULT_SEARCH_REQUEST_LIMIT,
  onCompleted,
  skip,
  useRecordsWithoutConnection = false,
  depth,
}: ObjectMetadataItemIdentifier &
  ObjectRecordQueryVariables & {
    onCompleted?: (data: ObjectRecordConnection<T>) => void;
    skip?: boolean;
    useRecordsWithoutConnection?: boolean;
    depth?: number;
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

  const { objectMetadataItem, findManyRecordsQuery } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
    depth,
  );

  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data, loading, error, fetchMore } = useQuery<
    ObjectRecordQueryResult<T>
  >(findManyRecordsQuery, {
    skip: skip || !objectMetadataItem || !currentWorkspace,
    variables: {
      filter,
      limit,
      orderBy,
    },
    onCompleted: (data) => {
      onCompleted?.(data[objectMetadataItem.namePlural]);

      if (data?.[objectMetadataItem.namePlural]) {
        setLastCursor(
          data?.[objectMetadataItem.namePlural]?.pageInfo.endCursor ?? '',
        );
        setHasNextPage(
          data?.[objectMetadataItem.namePlural]?.pageInfo.hasNextPage ?? false,
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
            filter,
            orderBy,
            lastCursor: isNonEmptyString(lastCursor) ? lastCursor : undefined,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            const previousEdges = prev?.[objectMetadataItem.namePlural]?.edges;
            const nextEdges =
              fetchMoreResult?.[objectMetadataItem.namePlural]?.edges;

            let newEdges: ObjectRecordEdge<T>[] = [];

            if (isNonEmptyArray(previousEdges) && isNonEmptyArray(nextEdges)) {
              newEdges = filterUniqueRecordEdgesByCursor([
                ...(prev?.[objectMetadataItem.namePlural]?.edges ?? []),
                ...(fetchMoreResult?.[objectMetadataItem.namePlural]?.edges ??
                  []),
              ]);
            }

            if (data?.[objectMetadataItem.namePlural]) {
              setLastCursor(
                fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo
                  .endCursor ?? '',
              );
              setHasNextPage(
                fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo
                  .hasNextPage ?? false,
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
            } as ObjectRecordQueryResult<T>);
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

  // TODO: remove this and use only mapConnectionToRecords when we've finished the refactor
  const records = useMemo(
    () =>
      mapPaginatedRecordsToRecords({
        pagedRecords: data,
        objectNamePlural: objectMetadataItem.namePlural,
      }) as T[],
    [data, objectMetadataItem],
  );

  const mapConnectionToRecords = useMapConnectionToRecords();

  const recordsWithoutConnection = useMemo(
    () =>
      useRecordsWithoutConnection
        ? (mapConnectionToRecords({
            objectRecordConnection: data?.[objectMetadataItem.namePlural],
            objectNameSingular,
            depth: 5,
          }) as T[])
        : [],
    [
      data,
      objectNameSingular,
      objectMetadataItem.namePlural,
      mapConnectionToRecords,
      useRecordsWithoutConnection,
    ],
  );

  return {
    objectMetadataItem,
    records: useRecordsWithoutConnection ? recordsWithoutConnection : records,
    loading,
    error,
    fetchMoreRecords,
    queryStateIdentifier: findManyQueryStateIdentifier,
  };
};
