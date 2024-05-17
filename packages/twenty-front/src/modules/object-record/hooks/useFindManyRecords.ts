import { useCallback, useMemo } from 'react';
import { useQuery, WatchQueryFetchPolicy } from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreRecordsFamilyState } from '../states/isFetchingMoreRecordsFamilyState';

export const useFindManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  onCompleted,
  skip,
  recordGqlFields,
  fetchPolicy,
}: ObjectMetadataItemIdentifier &
  RecordGqlOperationVariables & {
    onCompleted?: (
      records: T[],
      options?: {
        pageInfo?: RecordGqlConnection['pageInfo'];
        totalCount?: number;
      },
    ) => void;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
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

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { data, loading, error, fetchMore } =
    useQuery<RecordGqlOperationFindManyResult>(findManyRecordsQuery, {
      skip: skip || !objectMetadataItem || !currentWorkspaceMember,
      variables: {
        filter,
        limit,
        orderBy,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: (data) => {
        if (!isDefined(data)) {
          onCompleted?.([]);
        }

        const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

        const records = getRecordsFromRecordConnection({
          recordConnection: data?.[objectMetadataItem.namePlural],
        }) as T[];

        onCompleted?.(records, {
          pageInfo,
          totalCount: data?.[objectMetadataItem.namePlural]?.totalCount,
        });

        if (isDefined(data?.[objectMetadataItem.namePlural])) {
          setLastCursor(pageInfo.endCursor ?? '');
          setHasNextPage(pageInfo.hasNextPage ?? false);
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
    // Remote objects does not support hasNextPage. We cannot rely on it to fetch more records.
    if (hasNextPage || objectMetadataItem.isRemote) {
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

            let newEdges: RecordGqlEdge[] = [];

            if (isNonEmptyArray(previousEdges) && isNonEmptyArray(nextEdges)) {
              newEdges = filterUniqueRecordEdgesByCursor([
                ...(prev?.[objectMetadataItem.namePlural]?.edges ?? []),
                ...(fetchMoreResult?.[objectMetadataItem.namePlural]?.edges ??
                  []),
              ]);
            }

            if (isNonEmptyArray(previousEdges) && !isNonEmptyArray(nextEdges)) {
              newEdges = prev?.[objectMetadataItem.namePlural]?.edges ?? [];
            }

            const pageInfo =
              fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo;

            if (isDefined(data?.[objectMetadataItem.namePlural])) {
              setLastCursor(pageInfo.endCursor ?? '');
              setHasNextPage(pageInfo.hasNextPage ?? false);
            }

            const records = getRecordsFromRecordConnection({
              recordConnection: {
                edges: newEdges,
                pageInfo,
              },
            }) as T[];

            onCompleted?.(records, {
              pageInfo,
              totalCount:
                fetchMoreResult?.[objectMetadataItem.namePlural]?.totalCount,
            });

            return Object.assign({}, prev, {
              [objectMetadataItem.namePlural]: {
                __typename: `${capitalize(
                  objectMetadataItem.nameSingular,
                )}Connection`,
                edges: newEdges,
                pageInfo:
                  fetchMoreResult?.[objectMetadataItem.namePlural].pageInfo,
                totalCount:
                  fetchMoreResult?.[objectMetadataItem.namePlural].totalCount,
              },
            } as RecordGqlOperationFindManyResult);
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
    objectMetadataItem.isRemote,
    objectMetadataItem.namePlural,
    objectMetadataItem.nameSingular,
    setIsFetchingMoreObjects,
    fetchMore,
    filter,
    orderBy,
    lastCursor,
    data,
    onCompleted,
    setLastCursor,
    setHasNextPage,
    enqueueSnackBar,
  ]);

  const totalCount = data?.[objectMetadataItem.namePlural].totalCount ?? 0;

  const records = useMemo(
    () =>
      data?.[objectMetadataItem.namePlural]
        ? getRecordsFromRecordConnection<T>({
            recordConnection: data?.[objectMetadataItem.namePlural],
          })
        : ([] as T[]),

    [data, objectMetadataItem.namePlural],
  );

  return {
    objectMetadataItem,
    records,
    totalCount,
    loading,
    error,
    fetchMoreRecords,
    queryStateIdentifier: findManyQueryStateIdentifier,
  };
};
