import { gql, useQuery } from '@apollo/client';

import type {
  EventLogQueryInput,
  EventLogQueryResult,
  EventLogRecord,
} from '~/pages/settings/security/event-logs/types';

const QUERY_EVENT_LOGS = gql`
  query QueryEventLogs($input: EventLogQueryInput!) {
    queryEventLogs(input: $input) {
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
      hasNextPage
    }
  }
`;

type QueryEventLogsData = {
  queryEventLogs: EventLogQueryResult;
};

type QueryEventLogsVariables = {
  input: EventLogQueryInput;
};

export const useQueryEventLogs = (input: EventLogQueryInput) => {
  const { data, loading, error, refetch, fetchMore } = useQuery<
    QueryEventLogsData,
    QueryEventLogsVariables
  >(QUERY_EVENT_LOGS, {
    variables: { input },
    fetchPolicy: 'network-only',
  });

  const records = data?.queryEventLogs.records ?? ([] as EventLogRecord[]);
  const totalCount = data?.queryEventLogs.totalCount ?? 0;
  const hasNextPage = data?.queryEventLogs.hasNextPage ?? false;

  const loadMore = () => {
    if (!hasNextPage || loading) {
      return;
    }

    fetchMore({
      variables: {
        input: {
          ...input,
          offset: records.length,
        },
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        return {
          queryEventLogs: {
            ...fetchMoreResult.queryEventLogs,
            records: [
              ...previousResult.queryEventLogs.records,
              ...fetchMoreResult.queryEventLogs.records,
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
