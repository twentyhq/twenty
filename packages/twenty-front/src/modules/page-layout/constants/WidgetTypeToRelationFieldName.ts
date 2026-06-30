import { WidgetType } from '~/generated-metadata/graphql';

export const WIDGET_TYPE_TO_RELATION_FIELD_NAME: Partial<
  Record<WidgetType, string>
> = {
  [WidgetType.TASKS]: 'taskTargets',
  [WidgetType.NOTES]: 'noteTargets',
  [WidgetType.FILES]: 'attachments',
  [WidgetType.TIMELINE]: 'timelineActivities',
  [WidgetType.EMAILS]: 'messageParticipants',
  [WidgetType.CALENDAR]: 'calendarEventParticipants',
};
