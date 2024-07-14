import { gql } from '@apollo/client';

export const RUN_ANALYTICS_QUERY = gql`
  mutation RunChartQuery($chartId: String!) {
    runChartQuery(chartId: $chartId) {
      chartResult
    }
  }
`;
