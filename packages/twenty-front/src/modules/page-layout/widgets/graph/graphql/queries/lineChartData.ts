import { gql } from '@apollo/client';

export const LINE_CHART_DATA = gql`
  query LineChartData($input: LineChartDataInput!) {
    lineChartData(input: $input) {
      series {
        key
        label
        data {
          x
          y
        }
      }
      xAxisLabel
      yAxisLabel
      showLegend
      showDataLabels
      hasTooManyGroups
      formattedToRawLookup
    }
  }
`;
