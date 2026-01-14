import { gql } from '@apollo/client';

export const BAR_CHART_DATA = gql`
  query BarChartData($input: BarChartDataInput!) {
    barChartData(input: $input) {
      data
      indexBy
      keys
      series {
        key
        label
      }
      xAxisLabel
      yAxisLabel
      showLegend
      showDataLabels
      layout
      groupMode
      hasTooManyGroups
      formattedToRawLookup
    }
  }
`;
