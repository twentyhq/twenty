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
        configurationType
        aggregateFieldMetadataId
        aggregateOperation
        primaryAxisGroupByFieldMetadataId
        primaryAxisGroupBySubFieldName
        primaryAxisDateGranularity
        primaryAxisOrderBy
        secondaryAxisGroupByFieldMetadataId
        secondaryAxisGroupBySubFieldName
        secondaryAxisGroupByDateGranularity
        secondaryAxisOrderBy
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
        layout
        isCumulative
        timezone
        firstDayOfTheWeek
      }
      ... on LineChartConfiguration {
        configurationType
        aggregateFieldMetadataId
        aggregateOperation
        primaryAxisGroupByFieldMetadataId
        primaryAxisGroupBySubFieldName
        primaryAxisDateGranularity
        primaryAxisOrderBy
        secondaryAxisGroupByFieldMetadataId
        secondaryAxisGroupBySubFieldName
        secondaryAxisGroupByDateGranularity
        secondaryAxisOrderBy
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
        configurationType
        groupByFieldMetadataId
        aggregateFieldMetadataId
        aggregateOperation
        groupBySubFieldName
        dateGranularity
        orderBy
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
        configurationType
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
        configurationType
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
