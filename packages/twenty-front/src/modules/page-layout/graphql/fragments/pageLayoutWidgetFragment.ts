import { gql } from '@apollo/client';

export const PAGE_LAYOUT_WIDGET_FRAGMENT = gql`
  fragment PageLayoutWidgetFragment on PageLayoutWidget {
    id
    title
    type
    objectMetadataId
    createdAt
    updatedAt
    deletedAt
    gridPosition {
      column
      columnSpan
      row
      rowSpan
    }
    configuration {
      ... on BarChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        groupByFieldMetadataIdX
        orderByX
        groupByFieldMetadataIdY
        orderByY
        omitNullValues
        xAxisName
        yAxisName
        rangeMin
        rangeMax
        filter
      }
      ... on LineChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        groupByFieldMetadataIdX
        orderByX
        groupByFieldMetadataIdY
        orderByY
        filter
      }
      ... on PieChartConfiguration {
        graphType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        orderBy
        filter
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
        aggregateOperationTotal
        aggregateFieldMetadataIdTotal
        description
        filter
      }
      ... on IframeConfiguration {
        url
      }
    }
    pageLayoutTabId
  }
`;
