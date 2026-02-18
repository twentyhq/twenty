import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type CalendarConfiguration,
  type EmailsConfiguration,
  type FieldRichTextConfiguration,
  type FilesConfiguration,
  type FrontComponentConfiguration,
  type GaugeChartConfiguration,
  type IframeConfiguration,
  type LineChartConfiguration,
  type NotesConfiguration,
  type PieChartConfiguration,
  type StandaloneRichTextConfiguration,
  type TasksConfiguration,
  type TimelineConfiguration,
  type ViewConfiguration,
  type WidgetConfiguration,
  type WidgetConfigurationType,
  type WorkflowConfiguration,
  type WorkflowRunConfiguration,
  type WorkflowVersionConfiguration,
} from '~/generated-metadata/graphql';

type WidgetConfigurationTypenameMap = {
  AggregateChartConfiguration: Omit<
    AggregateChartConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.AGGREGATE_CHART;
  };
  BarChartConfiguration: Omit<BarChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.BAR_CHART;
  };
  CalendarConfiguration: Omit<CalendarConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.CALENDAR;
  };
  FrontComponentConfiguration: Omit<
    FrontComponentConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.FRONT_COMPONENT;
  };
  EmailsConfiguration: Omit<EmailsConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.EMAILS;
  };
  FieldConfiguration: Omit<FieldConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.FIELD;
  };
  FieldRichTextConfiguration: Omit<
    FieldRichTextConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.FIELD_RICH_TEXT;
  };
  FieldsConfiguration: Omit<FieldsConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.FIELDS;
  };
  FilesConfiguration: Omit<FilesConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.FILES;
  };
  GaugeChartConfiguration: Omit<
    GaugeChartConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.GAUGE_CHART;
  };
  IframeConfiguration: Omit<IframeConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.IFRAME;
  };
  LineChartConfiguration: Omit<LineChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.LINE_CHART;
  };
  NotesConfiguration: Omit<NotesConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.NOTES;
  };
  PieChartConfiguration: Omit<PieChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.PIE_CHART;
  };
  StandaloneRichTextConfiguration: Omit<
    StandaloneRichTextConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;
  };
  TasksConfiguration: Omit<TasksConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.TASKS;
  };
  TimelineConfiguration: Omit<TimelineConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.TIMELINE;
  };
  ViewConfiguration: Omit<ViewConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.VIEW;
  };
  WorkflowConfiguration: Omit<WorkflowConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.WORKFLOW;
  };
  WorkflowRunConfiguration: Omit<
    WorkflowRunConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.WORKFLOW_RUN;
  };
  WorkflowVersionConfiguration: Omit<
    WorkflowVersionConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.WORKFLOW_VERSION;
  };
};

type WidgetConfigurationTypename = keyof WidgetConfigurationTypenameMap;

export type WidgetConfigurationOfType<T extends WidgetConfigurationTypename> =
  WidgetConfigurationTypenameMap[T];

export const isWidgetConfigurationOfType = <
  T extends WidgetConfigurationTypename,
>(
  configuration:
    | WidgetConfiguration
    | FieldsConfiguration
    | FieldConfiguration
    | null
    | undefined,
  typename: T,
): configuration is WidgetConfigurationTypenameMap[T] => {
  return configuration?.__typename === typename;
};
