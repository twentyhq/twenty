import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCustomResolver = (
  query: any,
  queryName: string,
  objectName: string,
  activityTargetableObject: ActivityTargetableObject,
  pageSize: number,
): {
  data: any;
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
  } = useQuery(query, {
    variables: queryVariables,
    onError: (error) => {
      enqueueSnackBar(error.message || `Error loading ${objectName}`, {
        variant: 'error',
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
            setPage((calendarEventsPage) => ({
              ...calendarEventsPage,
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

      setPage((calendarEventsPage) => ({
        ...calendarEventsPage,
        pageNumber: calendarEventsPage.pageNumber + 1,
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
