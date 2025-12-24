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
        primaryAxisGroupByFieldMetadataId
        primaryAxisGroupBySubFieldName
        primaryAxisDateGranularity
        primaryAxisOrderBy
        primaryAxisManualSortOrder
        secondaryAxisGroupByFieldMetadataId
        secondaryAxisGroupBySubFieldName
        secondaryAxisGroupByDateGranularity
        secondaryAxisOrderBy
        secondaryAxisManualSortOrder
        omitNullValues
        axisNameDisplay
        displayDataLabel
        displayLegend
        rangeMin
        rangeMax
        color
        description
        filter
        groupMode
        isCumulative
        timezone
        firstDayOfTheWeek
      }
      ... on LineChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        primaryAxisGroupByFieldMetadataId
        primaryAxisGroupBySubFieldName
        primaryAxisDateGranularity
        primaryAxisOrderBy
        primaryAxisManualSortOrder
        secondaryAxisGroupByFieldMetadataId
        secondaryAxisGroupBySubFieldName
        secondaryAxisGroupByDateGranularity
        secondaryAxisOrderBy
        secondaryAxisManualSortOrder
        omitNullValues
        axisNameDisplay
        displayDataLabel
        displayLegend
        rangeMin
        rangeMax
        color
        description
        filter
        isStacked
        isCumulative
        timezone
        firstDayOfTheWeek
      }
      ... on PieChartConfiguration {
        graphType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        groupBySubFieldName
        dateGranularity
        orderBy
        manualSortOrder
        displayDataLabel
        showCenterMetric
        displayLegend
        color
        description
        filter
        timezone
        firstDayOfTheWeek
      }
      ... on AggregateChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        label
        displayDataLabel
        format
        description
        filter
        prefix
        suffix
        timezone
        firstDayOfTheWeek
        ratioAggregateConfig {
          fieldMetadataId
          optionValue
        }
      }
      ... on GaugeChartConfiguration {
        graphType
        aggregateFieldMetadataId
        aggregateOperation
        displayDataLabel
        color
        description
        filter
        timezone
        firstDayOfTheWeek
      }
      ... on IframeConfiguration {
        url
      }
      ... on StandaloneRichTextConfiguration {
        body {
          blocknote
          markdown
        }
      }
    }
    pageLayoutTabId
  }
`;
