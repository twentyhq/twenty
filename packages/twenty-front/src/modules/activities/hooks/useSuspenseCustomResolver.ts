import {
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { useSuspenseQuery } from '@apollo/client/react';
import { useCallback, useState, useTransition } from 'react';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

type CustomResolverQueryResult<
  T extends {
    [key: string]: any;
  },
> = {
  [queryName: string]: T;
};

// Suspense counterpart of the removed useCustomResolver: it starts fetching
// during render, so content inside a hidden <Activity> preloads, and it runs
// fetchMore/refetch in transitions so an already rendered list never falls
// back to its Suspense skeleton.
export const useSuspenseCustomResolver = <
  T extends {
    [key: string]: any;
  },
>(
  query:
    | DocumentNode
    | TypedDocumentNode<CustomResolverQueryResult<T>, OperationVariables>,
  queryName: string,
  objectName: string,
  activityTargetableObject: ActivityTargetableObject,
  pageSize: number,
): {
  data: CustomResolverQueryResult<T> | undefined;
  isFetchingMore: boolean;
  fetchMoreRecords: () => Promise<void>;
  refetch: () => Promise<void>;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const [page, setPage] = useState({
    pageNumber: 1,
    hasNextPage: true,
  });

  const [isFetchingMore, startFetchMoreTransition] = useTransition();

  const queryVariables = {
    objectNameSingular: activityTargetableObject.targetObjectNameSingular,
    recordId: activityTargetableObject.id,
    page: 1,
    pageSize,
  };

  const { data, error, fetchMore, refetch } = useSuspenseQuery<
    CustomResolverQueryResult<T>
  >(query, {
    client: apolloCoreClient,
    variables: queryVariables,
    errorPolicy: 'all',
  });

  useSnackBarOnQueryError(error);

  const fetchMoreRecords = async () => {
    if (!page.hasNextPage || isFetchingMore) {
      return;
    }

    startFetchMoreTransition(async () => {
      await fetchMore({
        variables: {
          ...queryVariables,
          page: page.pageNumber + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[queryName]?.[objectName]?.length) {
            setPage((page) => ({
              ...page,
              hasNextPage: false,
            }));

            return {
              [queryName]: {
                ...prev?.[queryName],
                [objectName]: [...(prev?.[queryName]?.[objectName] ?? [])],
              },
            };
          }

          return {
            [queryName]: {
              ...prev?.[queryName],
              [objectName]: [
                ...(prev?.[queryName]?.[objectName] ?? []),
                ...(fetchMoreResult?.[queryName]?.[objectName] ?? []),
              ],
            },
          };
        },
      });

      setPage((page) => ({
        ...page,
        pageNumber: page.pageNumber + 1,
      }));
    });
  };

  const [, startRefetchTransition] = useTransition();

  const refetchInTransition = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        startRefetchTransition(async () => {
          try {
            await refetch();
            resolve();
          } catch (refetchError) {
            reject(refetchError);
          }
        });
      }),
    [refetch, startRefetchTransition],
  );

  return {
    data,
    isFetchingMore,
    fetchMoreRecords,
    refetch: refetchInTransition,
  };
};
