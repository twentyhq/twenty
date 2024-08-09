import { gql } from '@apollo/client';

export const CHART_DATA = gql`
  query ChartData($chartId: String!) {
    chartData(chartId: $chartId) {
      chartResult
    }
  }
`;
