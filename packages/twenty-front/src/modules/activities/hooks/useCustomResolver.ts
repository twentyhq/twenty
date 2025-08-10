import {
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
  useQuery,
} from '@apollo/client';
import { useState } from 'react';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

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
  const { enqueueErrorSnackBar } = useSnackBar();

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

  const {
    data,
    loading: firstQueryLoading,
    fetchMore,
  } = useQuery<CustomResolverQueryResult<T>>(query, {
    variables: queryVariables,
    onError: (error) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
  });

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
