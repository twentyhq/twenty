import { useQuery } from '@apollo/client';

import {
  type EventLogQueryInput,
  type EventLogQueryResult,
  type EventLogRecord,
} from '~/generated-metadata/graphql';
import { GET_EVENT_LOGS } from '~/pages/settings/security/event-logs/graphql/queries/getEventLogs';

type EventLogsData = {
  eventLogs: EventLogQueryResult;
};

type EventLogsVariables = {
  input: EventLogQueryInput;
};

export const useEventLogs = (input: EventLogQueryInput) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<
    EventLogsData,
    EventLogsVariables
  >(GET_EVENT_LOGS, {
    variables: { input },
    fetchPolicy: 'network-only',
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
        if (!fetchMoreResult) {
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
    totalCount,
    hasNextPage,
    loading,
    error,
    refetch,
    loadMore,
  };
};
