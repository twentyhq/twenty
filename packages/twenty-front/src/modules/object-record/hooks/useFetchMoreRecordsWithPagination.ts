import {
  ApolloError,
  ApolloQueryResult,
  FetchMoreQueryOptions,
  OperationVariables,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { isAggregationEnabled } from '@/object-metadata/utils/isAggregationEnabled';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreRecordsFamilyState } from '../states/isFetchingMoreRecordsFamilyState';

export type UseFindManyRecordsParams<T> = ObjectMetadataItemIdentifier &
  RecordGqlOperationVariables & {
    onCompleted?: OnFindManyRecordsCompleted<T>;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
  };

type UseFindManyRecordsStateParams<
  T,
  TData = RecordGqlOperationFindManyResult,
> = Omit<
  UseFindManyRecordsParams<T>,
  'skip' | 'recordGqlFields' | 'fetchPolicy'
> & {
  data: RecordGqlOperationFindManyResult | undefined;
  error: ApolloError | undefined;
  fetchMore<
    TFetchData = TData,
    TFetchVars extends OperationVariables = OperationVariables,
  >(
    fetchMoreOptions: FetchMoreQueryOptions<TFetchVars, TFetchData> & {
      updateQuery?: (
        previousQueryResult: TData,
        options: {
          fetchMoreResult: TFetchData;
          variables: TFetchVars;
        },
      ) => TData;
    },
  ): Promise<ApolloQueryResult<TFetchData>>;
  objectMetadataItem: ObjectMetadataItem;
};

export const useFetchMoreRecordsWithPagination = <
  T extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  data,
  error,
  fetchMore,
  objectMetadataItem,
  onCompleted,
}: UseFindManyRecordsStateParams<T>) => {
  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter,
    limit,
    orderBy,
  });

  const [hasNextPage] = useRecoilState(hasNextPageFamilyState(queryIdentifier));

  const setIsFetchingMoreObjects = useSetRecoilState(
    isFetchingMoreRecordsFamilyState(queryIdentifier),
  );

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  // TODO: put this into a util inspired from https://github.com/apollographql/apollo-client/blob/master/src/utilities/policies/pagination.ts
  // This function is equivalent to merge function + read function in field policy
  const fetchMoreRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const hasNextPageLocal = snapshot
          .getLoadable(hasNextPageFamilyState(queryIdentifier))
          .getValue();

        const lastCursorLocal = snapshot
          .getLoadable(cursorFamilyState(queryIdentifier))
          .getValue();

        // Remote objects does not support hasNextPage. We cannot rely on it to fetch more records.
        if (
          hasNextPageLocal ||
          (!isAggregationEnabled(objectMetadataItem) && !error)
        ) {
          setIsFetchingMoreObjects(true);

          try {
            const { data: fetchMoreDataResult } = await fetchMore({
              variables: {
                filter,
                orderBy,
                lastCursor: isNonEmptyString(lastCursorLocal)
                  ? lastCursorLocal
                  : undefined,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                const previousEdges =
                  prev?.[objectMetadataItem.namePlural]?.edges;
                const nextEdges =
                  fetchMoreResult?.[objectMetadataItem.namePlural]?.edges;

                let newEdges: RecordGqlEdge[] = previousEdges ?? [];

                if (isNonEmptyArray(nextEdges)) {
                  newEdges = filterUniqueRecordEdgesByCursor([
                    ...newEdges,
                    ...(fetchMoreResult?.[objectMetadataItem.namePlural]
                      ?.edges ?? []),
                  ]);
                }

                const pageInfo =
                  fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo;

                if (isDefined(pageInfo)) {
                  set(
                    cursorFamilyState(queryIdentifier),
                    pageInfo.endCursor ?? '',
                  );
                  set(
                    hasNextPageFamilyState(queryIdentifier),
                    pageInfo.hasNextPage ?? false,
                  );
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
                    fetchMoreResult?.[objectMetadataItem.namePlural]
                      ?.totalCount,
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
                      fetchMoreResult?.[objectMetadataItem.namePlural]
                        .totalCount,
                  },
                } as RecordGqlOperationFindManyResult);
              },
            });

            return {
              data: fetchMoreDataResult?.[objectMetadataItem.namePlural],
            };
          } catch (error) {
            handleFindManyRecordsError(error as ApolloError);
            return { error: error as ApolloError };
          } finally {
            setIsFetchingMoreObjects(false);
          }
        }
      },
    [
      objectMetadataItem,
      error,
      setIsFetchingMoreObjects,
      fetchMore,
      filter,
      orderBy,
      onCompleted,
      handleFindManyRecordsError,
      queryIdentifier,
    ],
  );

  const totalCount = data?.[objectMetadataItem.namePlural]?.totalCount;

  const recordConnection = data?.[objectMetadataItem.namePlural];

  const records = useMemo(
    () =>
      isDefined(recordConnection)
        ? getRecordsFromRecordConnection<T>({
            recordConnection,
          })
        : [],
    [recordConnection],
  );

  return {
    fetchMoreRecords,
    totalCount,
    records,
    hasNextPage,
  };
};
