import {
  type ApolloError,
  type ApolloQueryResult,
  type FetchMoreQueryOptions,
  type OperationVariables,
  type WatchQueryFetchPolicy,
} from '@apollo/client';
import { type Unmasked } from '@apollo/client/masking';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { isAggregationEnabled } from '@/object-metadata/utils/isAggregationEnabled';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';

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
  'skip' | 'recordGqlFields' | 'fetchPolicy' | 'onCompleted'
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
          fetchMoreResult: Unmasked<TFetchData>;
          variables: TFetchVars;
        },
      ) => TData;
    },
  ): Promise<ApolloQueryResult<TFetchData>>;
  objectMetadataItem: ObjectMetadataItem;
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
}: UseFindManyRecordsStateParams<T>) => {
  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter,
    limit,
    orderBy,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
    objectMetadataItem,
  });

  // TODO: put this into a util inspired from https://github.com/apollographql/apollo-client/blob/master/src/utilities/policies/pagination.ts
  // This function is equivalent to merge function + read function in field policy
  const fetchMoreRecordsLazy = useRecoilCallback(
    ({ snapshot, set }) =>
      async (limit = DEFAULT_SEARCH_REQUEST_LIMIT) => {
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
          try {
            const { data: fetchMoreDataResult } = await fetchMore({
              variables: {
                limit,
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
              totalCount:
                fetchMoreDataResult?.[objectMetadataItem.namePlural]
                  ?.totalCount,
              records: getRecordsFromRecordConnection({
                recordConnection: {
                  edges:
                    fetchMoreDataResult?.[objectMetadataItem.namePlural]?.edges,
                  pageInfo:
                    fetchMoreDataResult?.[objectMetadataItem.namePlural]
                      ?.pageInfo,
                },
              }) as T[],
            };
          } catch (error) {
            handleFindManyRecordsError(error as ApolloError);
            return { error: error as ApolloError };
          }
        }
      },
    [
      queryIdentifier,
      objectMetadataItem,
      error,
      fetchMore,
      filter,
      orderBy,
      handleFindManyRecordsError,
    ],
  );

  return {
    fetchMoreRecordsLazy,
  };
};
