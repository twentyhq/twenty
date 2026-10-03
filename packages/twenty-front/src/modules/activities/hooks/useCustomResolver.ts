import {
  type DocumentNode,
  type ErrorLike,
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
  extraVariables,
}: {
  query:
    | DocumentNode
    | TypedDocumentNode<CustomResolverQueryResult<T>, OperationVariables>;
  queryName: string;
  objectName: string;
  activityTargetableObject: ActivityTargetableObject;
  pageSize: number;
  extraVariables?: OperationVariables;
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
    ...extraVariables,
    objectNameSingular: activityTargetableObject.targetObjectNameSingular,
    recordId: activityTargetableObject.id,
    page: 1,
    pageSize,
  };

  const { data, loading, fetchMore, refetch, error } = useQuery<
    CustomResolverQueryResult<T>
  >(query, {
    client: apolloCoreClient,
    variables: queryVariables,
  });

  const firstQueryLoading = loading && !data;

  const loadedRecordsCount = data?.[queryName]?.[objectName]?.length ?? 0;

  const fetchMoreRecords = async () => {
    if (!isFetchingMore && !firstQueryLoading) {
      setIsFetchingMore(true);

      await fetchMore({
        variables: {
          ...queryVariables,
          // Refetches and variable changes replace the loaded pages, so the
          // next page must follow what is loaded rather than a stored counter
          page: Math.floor(loadedRecordsCount / pageSize) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => ({
          [queryName]: {
            ...prev?.[queryName],
            [objectName]: [
              ...(prev?.[queryName]?.[objectName] ?? []),
              ...(fetchMoreResult?.[queryName]?.[objectName] ?? []),
            ],
          },
        }),
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
