import { gql, useQuery } from '@apollo/client';

import type {
  EventLogQueryInput,
  EventLogQueryResult,
  EventLogRecord,
} from '~/pages/settings/security/event-logs/types';

const EVENT_LOGS_QUERY = gql`
  query EventLogs($input: EventLogQueryInput!) {
    eventLogs(input: $input) {
      records {
        event
        timestamp
        userId
        properties
        recordId
        objectMetadataId
        isCustom
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

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
  >(EVENT_LOGS_QUERY, {
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
