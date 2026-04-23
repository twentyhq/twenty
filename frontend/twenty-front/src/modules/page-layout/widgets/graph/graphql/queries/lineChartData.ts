import { gql } from '@apollo/client';

export const LINE_CHART_DATA = gql`
  query LineChartData($input: LineChartDataInput!) {
    lineChartData(input: $input) {
      series {
        id
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
