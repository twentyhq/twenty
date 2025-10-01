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
        axisNameDisplay
        displayDataLabel
        rangeMin
        rangeMax
        color
        description
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
        omitNullValues
        axisNameDisplay
        displayDataLabel
        rangeMin
        rangeMax
        color
        description
        filter
      }
      ... on PieChartConfiguration {
        graphType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        orderBy
        displayDataLabel
        color
        description
        filter
      }
      ... on NumberChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        displayDataLabel
        description
        filter
      }
      ... on GaugeChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        displayDataLabel
        color
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
