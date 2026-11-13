import {
  type DocumentNode,
  type ErrorLike,
  NetworkStatus,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

type CustomResolverQueryResult<
  T extends {
    [key: string]: any;
  },
> = {
  [queryName: string]: T;
};

export const useCustomResolver = <
  T extends {
    [key: string]: any;
  },
>({
  query,
  queryName,
  objectName,
  activityTargetableObject,
  pageSize,
  variables,
}: {
  query:
    | DocumentNode
    | TypedDocumentNode<CustomResolverQueryResult<T>, OperationVariables>;
  queryName: string;
  objectName: string;
  activityTargetableObject: ActivityTargetableObject;
  pageSize: number;
  variables?: OperationVariables;
}): {
  error: ErrorLike | undefined;
  data: CustomResolverQueryResult<T> | undefined;
  firstQueryLoading: boolean;
  isFetchingMore: boolean;
  fetchMoreRecords: () => Promise<void>;
  refetch: () => Promise<unknown>;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const queryVariables = {
    objectNameSingular: activityTargetableObject.targetObjectNameSingular,
    recordId: activityTargetableObject.id,
    page: 1,
    pageSize,
    ...variables,
  };

  const { data, loading, networkStatus, fetchMore, refetch, error } = useQuery<
    CustomResolverQueryResult<T>
  >(query, {
    client: apolloCoreClient,
    variables: queryVariables,
  });

  const firstQueryLoading = loading && !data;

  const [lastLoadedPage, setLastLoadedPage] = useState(() => ({
    pageNumber: Math.max(
      1,
      Math.ceil((data?.[queryName]?.[objectName]?.length ?? 0) / pageSize),
    ),
    hasNextPage: true,
  }));

  if (
    networkStatus === NetworkStatus.refetch &&
    (lastLoadedPage.pageNumber !== 1 || !lastLoadedPage.hasNextPage)
  ) {
    setLastLoadedPage({ pageNumber: 1, hasNextPage: true });
  }

  const fetchMoreRecords = async () => {
    if (lastLoadedPage.hasNextPage && !isFetchingMore && !loading) {
      setIsFetchingMore(true);

      const nextPageNumber = lastLoadedPage.pageNumber + 1;

      await fetchMore({
        variables: {
          ...queryVariables,
          page: nextPageNumber,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          const fetchedRecords =
            fetchMoreResult?.[queryName]?.[objectName] ?? [];
          const previousRecords = prev?.[queryName]?.[objectName] ?? [];

          setLastLoadedPage({
            pageNumber: nextPageNumber,
            hasNextPage: fetchedRecords.length > 0,
          });

          return {
            [queryName]: {
              ...prev?.[queryName],
              [objectName]: [...previousRecords, ...fetchedRecords],
            },
          };
        },
      });

      setIsFetchingMore(false);
    }
  };

  return {
    error,
    data,
    firstQueryLoading,
    isFetchingMore,
    fetchMoreRecords,
    refetch,
  };
};
