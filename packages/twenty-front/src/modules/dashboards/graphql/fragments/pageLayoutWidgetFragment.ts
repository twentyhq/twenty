import { gql } from '@apollo/client';

export const PAGE_LAYOUT_WIDGET_FRAGMENT = gql`
  fragment PageLayoutWidgetFragment on PageLayoutWidget {
    id
    title
    type
    objectMetadataId
    gridPosition {
      column
      columnSpan
      row
      rowSpan
    }
    configuration {
      ... on BarChartConfiguration {
        graphType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        orderBy
        limit
        showLegend
        filter
      }
      ... on LineChartConfiguration {
        graphType
        groupByFieldMetadataId
        xAxisFieldMetadataId
        yAxisFieldMetadataId
        aggregateOperation
        orderBy
        limit
        showLegend
        filter
        interpolation
        enableArea
        showDataLabels
      }
      ... on PieChartConfiguration {
        graphType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        orderBy
        limit
        showLegend
        filter
        showPercentages
      }
      ... on NumberChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        description
        filter
      }
      ... on GaugeChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        maxValue
        minValue
        label
        description
        color
        filter
      }
      ... on IframeConfiguration {
        url
      }
    }
    pageLayoutTabId
  }
`;
