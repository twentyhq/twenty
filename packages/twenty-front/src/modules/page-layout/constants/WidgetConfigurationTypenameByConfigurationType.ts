import {
  type WidgetConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export const WIDGET_CONFIGURATION_TYPENAME_BY_CONFIGURATION_TYPE = {
  [WidgetConfigurationType.AGGREGATE_CHART]: 'AggregateChartConfiguration',
  [WidgetConfigurationType.BAR_CHART]: 'BarChartConfiguration',
  [WidgetConfigurationType.CALENDAR]: 'CalendarConfiguration',
  [WidgetConfigurationType.CALL_RECORDING_SUMMARY]:
    'CallRecordingSummaryConfiguration',
  [WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT]:
    'CallRecordingTranscriptConfiguration',
  [WidgetConfigurationType.CHAT]: 'ChatConfiguration',
  [WidgetConfigurationType.CHAT_THREADS]: 'ChatThreadsConfiguration',
  [WidgetConfigurationType.EMAILS]: 'EmailsConfiguration',
  [WidgetConfigurationType.EMAIL_THREAD]: 'EmailThreadConfiguration',
  [WidgetConfigurationType.FIELD]: 'FieldConfiguration',
  [WidgetConfigurationType.FIELDS]: 'FieldsConfiguration',
  [WidgetConfigurationType.FIELD_RICH_TEXT]: 'FieldRichTextConfiguration',
  [WidgetConfigurationType.FILES]: 'FilesConfiguration',
  [WidgetConfigurationType.FORM_FIELD]: 'FormFieldConfiguration',
  [WidgetConfigurationType.FRONT_COMPONENT]: 'FrontComponentConfiguration',
  [WidgetConfigurationType.IFRAME]: 'IframeConfiguration',
  [WidgetConfigurationType.LINE_CHART]: 'LineChartConfiguration',
  [WidgetConfigurationType.MESSAGE_CAMPAIGN_BODY]:
    'MessageCampaignBodyConfiguration',
  [WidgetConfigurationType.MESSAGE_CAMPAIGN_DETAILS]:
    'MessageCampaignDetailsConfiguration',
  [WidgetConfigurationType.NOTES]: 'NotesConfiguration',
  [WidgetConfigurationType.PIE_CHART]: 'PieChartConfiguration',
  [WidgetConfigurationType.RECORD_TABLE]: 'RecordTableConfiguration',
  [WidgetConfigurationType.STANDALONE_RICH_TEXT]:
    'StandaloneRichTextConfiguration',
  [WidgetConfigurationType.TASKS]: 'TasksConfiguration',
  [WidgetConfigurationType.TIMELINE]: 'TimelineConfiguration',
  [WidgetConfigurationType.VIEW]: 'ViewConfiguration',
  [WidgetConfigurationType.WORKFLOW]: 'WorkflowConfiguration',
  [WidgetConfigurationType.WORKFLOW_RUN]: 'WorkflowRunConfiguration',
  [WidgetConfigurationType.WORKFLOW_VERSION]: 'WorkflowVersionConfiguration',
} as const satisfies Record<
  WidgetConfigurationType,
  NonNullable<WidgetConfiguration['__typename']>
>;
