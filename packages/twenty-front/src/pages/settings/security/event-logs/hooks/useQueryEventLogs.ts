import { gql, useQuery } from '@apollo/client';

import {
  EventLogQueryInput,
  EventLogQueryResult,
  EventLogRecord,
} from '../types';

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
  const { data, loading, error, refetch } = useQuery<
    QueryEventLogsData,
    QueryEventLogsVariables
  >(QUERY_EVENT_LOGS, {
    variables: { input },
    fetchPolicy: 'network-only',
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Event logs query error:', err);
    },
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Event logs query error:', error);
  }

  return {
    records: data?.queryEventLogs.records ?? ([] as EventLogRecord[]),
    totalCount: data?.queryEventLogs.totalCount ?? 0,
    hasNextPage: data?.queryEventLogs.hasNextPage ?? false,
    loading,
    error,
    refetch,
  };
};
