import { traceableAccessLogFragment } from '@/traceable-access-logs/graphql/queries/fragments/traceableAccessLogFragment';
import { gql } from '@apollo/client';

export const traceableAccessLogWithTotalFragment = gql`
  fragment TraceableAccessLogWithTotalFragment on TraceableAccessLogsConnection {
    totalCount
    edges {
      node {
        ...TraceableAccessLogFragment
      }
    }
  }
  ${traceableAccessLogFragment}
`;
