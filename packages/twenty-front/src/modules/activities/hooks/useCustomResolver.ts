import {
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from 'twenty-shared/types';

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
  firstQueryLoading: boolean;
  isFetchingMore: boolean;
  fetchMoreRecords: () => Promise<void>;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const [page, setPage] = useState({
    pageNumber: 1,
    hasNextPage: true,
  });

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const queryVariables = {
    ...(activityTargetableObject.targetObjectNameSingular ===
    CoreObjectNameSingular.Person
      ? { personId: activityTargetableObject.id }
      : activityTargetableObject.targetObjectNameSingular ===
          CoreObjectNameSingular.Opportunity
        ? { opportunityId: activityTargetableObject.id }
        : { companyId: activityTargetableObject.id }),
    page: 1,
    pageSize,
  };

  const { data, loading, fetchMore, error } = useQuery<
    CustomResolverQueryResult<T>
  >(query, {
    client: apolloCoreClient,
    variables: queryVariables,
  });

  const firstQueryLoading = loading && !data;

  useSnackBarOnQueryError(error);

  const fetchMoreRecords = async () => {
    if (page.hasNextPage && !isFetchingMore && !firstQueryLoading) {
      setIsFetchingMore(true);

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

      setIsFetchingMore(false);
    }
  };

  return {
    data,
    firstQueryLoading,
    isFetchingMore,
    fetchMoreRecords,
  };
};
