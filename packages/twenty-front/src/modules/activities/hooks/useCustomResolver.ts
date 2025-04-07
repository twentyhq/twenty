import {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client';
import { useState } from 'react';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
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
  const { enqueueSnackBar } = useSnackBar();

  const [page, setPage] = useState({
    pageNumber: 1,
    hasNextPage: true,
  });

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const queryVariables = {
    ...(activityTargetableObject.targetObjectNameSingular ===
    CoreObjectNameSingular.Person
      ? { personId: activityTargetableObject.id }
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
      enqueueSnackBar(error.message || `Error loading ${objectName}`, {
        variant: SnackBarVariant.Error,
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
