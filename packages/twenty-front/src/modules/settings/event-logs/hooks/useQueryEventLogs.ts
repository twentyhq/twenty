import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { GET_EVENT_LOGS } from '@/settings/event-logs/graphql/queries/getEventLogs';
import {
  type EventLogQueryInput,
  type EventLogQueryResult,
  type EventLogRecord,
} from '~/generated-metadata/graphql';

type EventLogsData = {
  eventLogs: EventLogQueryResult;
};

type EventLogsVariables = {
  input: EventLogQueryInput;
};

export const useEventLogs = (
  input: EventLogQueryInput,
  options?: { skip?: boolean; pollInterval?: number },
) => {
  const { data, loading, error, fetchMore, refetch } = useQuery<
    EventLogsData,
    EventLogsVariables
  >(GET_EVENT_LOGS, {
    variables: { input },
    fetchPolicy: 'network-only',
    skip: options?.skip,
    pollInterval: options?.pollInterval ?? 0,
  });

  const records = data?.eventLogs.records ?? ([] as EventLogRecord[]);
  const totalCount = data?.eventLogs.totalCount ?? 0;
  const endCursor = data?.eventLogs.pageInfo.endCursor;
  const hasNextPage = data?.eventLogs.pageInfo.hasNextPage ?? false;

  const loadMore = () => {
    if (!hasNextPage || loading || !endCursor) {
      return;
    }

    fetchMore({
      variables: {
        input: {
          ...input,
          after: endCursor,
        },
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!isDefined(fetchMoreResult)) {
          return previousResult;
        }

        return {
          eventLogs: {
            ...fetchMoreResult.eventLogs,
            records: [
              ...previousResult.eventLogs.records,
              ...fetchMoreResult.eventLogs.records,
            ],
          },
        };
      },
    });
  };

  return {
    records,
    canQueryInstanceLevel: data?.eventLogs.canQueryInstanceLevel ?? false,
    totalCount,
    hasNextPage,
    loading,
    error,
    loadMore,
    refetch,
  };
};
