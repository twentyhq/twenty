import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { PageLayout } from "src/logic-functions/types/dashboard.type";

// `configuration` is a GraphQL union (one type per widget configuration shape), so it must be
// selected via an inline fragment per member type - selecting fewer fields than a type has is
// fine (just less data captured), but naming a type or field that doesn't exist is a hard
// query-validation error, so only confirmed field names are listed here. Only the field/object/
// view reference keys relevant to cross-workspace remapping are pulled for the config-bearing
// types; the rest (Calendar, Notes, Tasks, ...) carry no such references, so only
// configurationType is selected for them.
const buildQuery = (pageLayoutType: 'DASHBOARD' | 'RECORD_PAGE') => `query findPageLayouts {
  getPageLayouts(pageLayoutType: ${pageLayoutType}) {
    id
    name
    type
    objectMetadataId
    isSystemSideEffect
    tabs {
      id
      title
      position
      layoutMode
      widgets {
        id
        pageLayoutTabId
        title
        type
        objectMetadataId
        gridPosition {
          row
          column
          rowSpan
          columnSpan
        }
        configuration {
          ... on AggregateChartConfiguration {
            configurationType
            aggregateFieldMetadataId
          }
          ... on PieChartConfiguration {
            configurationType
            aggregateFieldMetadataId
            groupByFieldMetadataId
          }
          ... on BarChartConfiguration {
            configurationType
            aggregateFieldMetadataId
            primaryAxisGroupByFieldMetadataId
            secondaryAxisGroupByFieldMetadataId
          }
          ... on LineChartConfiguration {
            configurationType
            aggregateFieldMetadataId
            primaryAxisGroupByFieldMetadataId
            secondaryAxisGroupByFieldMetadataId
          }
          ... on FieldConfiguration {
            configurationType
            fieldMetadataId
            nestedRelationFieldMetadataId
            viewId
          }
          ... on FieldsConfiguration {
            configurationType
            viewId
          }
          ... on RecordTableConfiguration {
            configurationType
            viewId
            recordLimit
          }
          ... on FrontComponentConfiguration {
            configurationType
            frontComponentId
          }
          ... on IframeConfiguration {
            configurationType
            url
          }
          ... on ViewConfiguration {
            configurationType
          }
          ... on CalendarConfiguration {
            configurationType
          }
          ... on CallRecordingSummaryConfiguration {
            configurationType
          }
          ... on CallRecordingTranscriptConfiguration {
            configurationType
          }
          ... on EmailThreadConfiguration {
            configurationType
          }
          ... on EmailsConfiguration {
            configurationType
          }
          ... on FieldRichTextConfiguration {
            configurationType
          }
          ... on FilesConfiguration {
            configurationType
          }
          ... on MessageCampaignBodyConfiguration {
            configurationType
          }
          ... on MessageCampaignDetailsConfiguration {
            configurationType
          }
          ... on NotesConfiguration {
            configurationType
          }
          ... on StandaloneRichTextConfiguration {
            configurationType
          }
          ... on TasksConfiguration {
            configurationType
          }
          ... on TimelineConfiguration {
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
        }
      }
    }
  }
}`;

export const findPageLayouts = async (
  client: AxiosInstance,
  pageLayoutType: 'DASHBOARD' | 'RECORD_PAGE',
): Promise<PageLayout[]> => {
  const data = await postGraphql<{ getPageLayouts: PageLayout[] }>(
    client,
    '/metadata',
    'findPageLayouts',
    buildQuery(pageLayoutType),
  );

  return data.getPageLayouts;
}
