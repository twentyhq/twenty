import { gql } from '@apollo/client';

export const PIE_CHART_DATA = gql`
  query PieChartData($input: PieChartDataInput!) {
    pieChartData(input: $input) {
      data {
        key
        value
      }
      showLegend
      showDataLabels
      showCenterMetric
      hasTooManyGroups
      formattedToRawLookup
    }
  }
`;
