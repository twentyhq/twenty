import { useCallback, useMemo } from 'react';
import {
  ApolloError,
  ApolloQueryResult,
  FetchMoreQueryOptions,
  OperationVariables,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { isAggregationEnabled } from '@/object-metadata/utils/isAggregationEnabled';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { filterUniqueRecordEdgesByCursor } from '@/object-record/utils/filterUniqueRecordEdgesByCursor';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from '~/utils/isDefined';
import { logError } from '~/utils/logError';
import { capitalize } from '~/utils/string/capitalize';

import { cursorFamilyState } from '../states/cursorFamilyState';
import { hasNextPageFamilyState } from '../states/hasNextPageFamilyState';
import { isFetchingMoreRecordsFamilyState } from '../states/isFetchingMoreRecordsFamilyState';

export type UseFindManyRecordsParams<T> = ObjectMetadataItemIdentifier &
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

export const useFindManyRecordsState = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  filter,
  orderBy,
  limit,
  onCompleted,
  data,
  error,
  fetchMore,
  objectMetadataItem,
}: UseFindManyRecordsStateParams<T>) => {
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

  const { enqueueSnackBar } = useSnackBar();

  const fetchMoreRecords = useCallback(async () => {
    // Remote objects does not support hasNextPage. We cannot rely on it to fetch more records.
    if (hasNextPage || (!isAggregationEnabled(objectMetadataItem) && !error)) {
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
            variant: SnackBarVariant.Error,
          },
        );
      } finally {
        setIsFetchingMoreObjects(false);
      }
    }
  }, [
    hasNextPage,
    objectMetadataItem,
    error,
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

  const totalCount = data?.[objectMetadataItem.namePlural]?.totalCount;

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
    findManyQueryStateIdentifier,
    setLastCursor,
    setHasNextPage,
    fetchMoreRecords,
    totalCount,
    records,
  };
};
