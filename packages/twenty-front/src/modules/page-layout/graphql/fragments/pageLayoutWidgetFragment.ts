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
    position {
      ... on PageLayoutWidgetGridPosition {
        layoutMode
        row
        column
        rowSpan
        columnSpan
      }
      ... on PageLayoutWidgetVerticalListPosition {
        layoutMode
        index
      }
      ... on PageLayoutWidgetCanvasPosition {
        layoutMode
      }
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
        layout
        isCumulative
        splitMultiValueFields
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
        splitMultiValueFields
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
        manualSortOrder
        displayDataLabel
        showCenterMetric
        displayLegend
        hideEmptyCategory
        splitMultiValueFields
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
        configurationType
        url
      }
      ... on StandaloneRichTextConfiguration {
        configurationType
        body {
          blocknote
          markdown
        }
      }
      ... on CalendarConfiguration {
        configurationType
      }
      ... on EmailsConfiguration {
        configurationType
      }
      ... on FieldConfiguration {
        configurationType
      }
      ... on FieldRichTextConfiguration {
        configurationType
      }
      ... on FieldsConfiguration {
        configurationType
      }
      ... on FilesConfiguration {
        configurationType
      }
      ... on NotesConfiguration {
        configurationType
      }
      ... on TasksConfiguration {
        configurationType
      }
      ... on TimelineConfiguration {
        configurationType
      }
      ... on ViewConfiguration {
        configurationType
      }
      ... on WorkflowConfiguration {
        configurationType
      }
      ... on WorkflowRunConfiguration {
        configurationType
      }
      ... on WorkflowVersionConfiguration {
        configurationType
      }
      ... on FrontComponentConfiguration {
        configurationType
        frontComponentId
      }
    }
    pageLayoutTabId
  }
`;
