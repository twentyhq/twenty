import { gql } from '@apollo/client';

export const LINE_CHART_DATA = gql`
  query LineChartData($input: LineChartDataInput!) {
    lineChartData(input: $input) {
      series {
        id
        label
        color
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
      colorMode
      formattedToRawLookup
    }
  }
`;
