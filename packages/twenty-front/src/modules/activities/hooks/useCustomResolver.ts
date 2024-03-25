import { useState } from 'react';
import { useQuery } from '@apollo/client';

import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCustomResolver = (
  threadQuery: any,
  queryName: string,
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

  const threadQueryVariables = {
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
  } = useQuery(threadQuery, {
    variables: threadQueryVariables,
    onError: (error) => {
      enqueueSnackBar(error.message || 'Error loading event threads', {
        variant: 'error',
      });
    },
  });

  const fetchMoreRecords = async () => {
    if (page.hasNextPage && !isFetchingMore && !firstQueryLoading) {
      setIsFetchingMore(true);

      await fetchMore({
        variables: {
          ...threadQueryVariables,
          page: page.pageNumber + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.[queryName]?.timelineCalendarEvents?.length) {
            setPage((calendarEventsPage) => ({
              ...calendarEventsPage,
              hasNextPage: false,
            }));
            return {
              [queryName]: {
                ...prev?.[queryName],
                timelineCalendarEvents: [
                  ...(prev?.[queryName]?.timelineCalendarEvents ?? []),
                ],
              },
            };
          }

          return {
            [queryName]: {
              ...prev?.[queryName],
              timelineCalendarEvents: [
                ...(prev?.[queryName]?.timelineCalendarEvents ?? []),
                ...(fetchMoreResult?.[queryName]?.timelineCalendarEvents ?? []),
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
