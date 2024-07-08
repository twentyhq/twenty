import { gql } from '@apollo/client';

export const RUN_ANALYTICS_QUERY = gql`
  mutation RunAnalyticsQuery($analyticsQueryId: String!) {
    runAnalyticsQuery(analyticsQueryId: $analyticsQueryId) {
      analyticsQueryResult
    }
  }
`;
