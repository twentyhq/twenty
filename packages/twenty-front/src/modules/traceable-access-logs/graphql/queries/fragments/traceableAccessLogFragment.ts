import { gql } from '@apollo/client';

export const traceableAccessLogFragment = gql`
  fragment TraceableAccessLogFragment on TraceableAccessLogs {
    id
    createdAt
    userAgent
    ipAddress
  }
`;
