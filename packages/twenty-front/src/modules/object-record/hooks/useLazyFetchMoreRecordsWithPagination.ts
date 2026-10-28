import {
  type ApolloClient,
  type ErrorLike,
  type ObservableQuery,
  type OperationVariables,
} from '@apollo/client';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useCallback } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isAggregationEnabled } from '@/object-metadata/utils/isAggregationEnabled';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { type LazyRecordQueryOptions } from '@/object-record/types/LazyRecordQueryOptions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { useStore } from 'jotai';
import {
  getConnectionTypename,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

type UseFindManyRecordsStateParams<
  T,
  TData = RecordGqlOperationFindManyResult,
> = Omit<
  UseFindManyRecordsParams<T>,
  'skip' | 'recordGqlFields' | 'fetchPolicy' | 'onCompleted' | 'onError'
> & {
  data: RecordGqlOperationFindManyResult | undefined;
  error: ErrorLike | undefined;
  fetchMore<
    TFetchData = TData,
    TFetchVars extends OperationVariables = OperationVariables,
  >(
    fetchMoreOptions: ObservableQuery.FetchMoreOptions<
      TData,
      OperationVariables,
      TFetchData,
      TFetchVars
    >,
  ): Promise<ApolloClient.QueryResult<TFetchData>>;
  objectMetadataItem: EnrichedObjectMetadataItem;
  shouldToastOnError?: boolean;
};

export const useLazyFetchMoreRecordsWithPagination = <
  T extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  error,
  fetchMore,
  objectMetadataItem,
  shouldToastOnError = true,
}: UseFindManyRecordsStateParams<T>) => {
  const store = useStore();
  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  // TODO: put this into a util inspired from https://github.com/apollographql/apollo-client/blob/master/src/utilities/policies/pagination.ts
  // This function is equivalent to merge function + read function in field policy
  const fetchMoreRecordsLazy = useCallback(
    async (
      options:
        | number
        | (LazyRecordQueryOptions & {
            limit?: number;
          }) = DEFAULT_SEARCH_REQUEST_LIMIT,
    ) => {
      const queryOptions: LazyRecordQueryOptions & { limit?: number } =
        isNumber(options) ? { limit: options } : options;
      const {
        limit: pageLimit = DEFAULT_SEARCH_REQUEST_LIMIT,
        filter: queryFilter = filter,
      } = queryOptions;
      const requestQueryIdentifier = getQueryIdentifier({
        objectNameSingular,
        filter: queryFilter,
        limit,
        orderBy,
      });
      const hasNextPageLocal = store.get(
        hasNextPageFamilyState.atomFamily(requestQueryIdentifier),
      );

      const lastCursorLocal = store.get(
        cursorFamilyState.atomFamily(requestQueryIdentifier),
      );

      // Remote objects does not support hasNextPage. We cannot rely on it to fetch more records.
      if (
        hasNextPageLocal ||
        (!isAggregationEnabled(objectMetadataItem) && !error)
      ) {
        try {
          const { data: fetchMoreDataResult } = await fetchMore({
            variables: {
              limit: pageLimit,
              filter: queryFilter,
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
                  ...(fetchMoreResult?.[objectMetadataItem.namePlural]?.edges ??
                    []),
                ]);
              }

              const pageInfo =
                fetchMoreResult?.[objectMetadataItem.namePlural]?.pageInfo;

              if (isDefined(pageInfo)) {
                store.set(
                  cursorFamilyState.atomFamily(requestQueryIdentifier),
                  pageInfo.endCursor ?? '',
                );
                store.set(
                  hasNextPageFamilyState.atomFamily(requestQueryIdentifier),
                  pageInfo.hasNextPage ?? false,
                );
              }

              return Object.assign({}, prev, {
                [objectMetadataItem.namePlural]: {
                  __typename: getConnectionTypename(
                    objectMetadataItem.nameSingular,
                  ),
                  edges: newEdges,
                  pageInfo:
                    fetchMoreResult?.[objectMetadataItem.namePlural].pageInfo,
                  totalCount:
                    fetchMoreResult?.[objectMetadataItem.namePlural].totalCount,
                },
              } as RecordGqlOperationFindManyResult);
            },
          });

          return {
            data: fetchMoreDataResult?.[objectMetadataItem.namePlural],
            totalCount:
              fetchMoreDataResult?.[objectMetadataItem.namePlural]?.totalCount,
            records: getRecordsFromRecordConnection({
              recordConnection: {
                edges:
                  fetchMoreDataResult?.[objectMetadataItem.namePlural]?.edges ??
                  [],
                pageInfo:
                  fetchMoreDataResult?.[objectMetadataItem.namePlural]
                    ?.pageInfo,
              },
            }) as T[],
          };
        } catch (error) {
          if (shouldToastOnError) {
            handleFindManyRecordsError(error as ErrorLike);
          }
          return { error: error as ErrorLike };
        }
      }
    },
    [
      objectNameSingular,
      limit,
      objectMetadataItem,
      error,
      fetchMore,
      filter,
      orderBy,
      handleFindManyRecordsError,
      shouldToastOnError,
      store,
    ],
  );

  return {
    fetchMoreRecordsLazy,
  };
};
