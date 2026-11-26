import { StandardObjectNameSingular } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

// TODO: temporary, remove once conditional availability supports object read access
export const WIDGET_TYPE_TO_READ_OBJECT_NAME_SINGULAR: Partial<
  Record<WidgetType, StandardObjectNameSingular>
> = {
  [WidgetType.TASKS]: StandardObjectNameSingular.Task,
  [WidgetType.NOTES]: StandardObjectNameSingular.Note,
  [WidgetType.FILES]: StandardObjectNameSingular.Attachment,
  [WidgetType.TIMELINE]: StandardObjectNameSingular.TimelineActivity,
  [WidgetType.EMAILS]: StandardObjectNameSingular.MessageThread,
  [WidgetType.CALENDAR]: StandardObjectNameSingular.CalendarEvent,
  [WidgetType.CALL_RECORDING_SUMMARY]: StandardObjectNameSingular.CallRecording,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]:
    StandardObjectNameSingular.CallRecording,
};
