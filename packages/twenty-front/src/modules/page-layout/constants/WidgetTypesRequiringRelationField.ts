import { WidgetType } from '~/generated-metadata/graphql';

// Emails and Calendar are absent on purpose: they aggregate through the messaging timeline.
export const WIDGET_TYPES_REQUIRING_RELATION_FIELD: WidgetType[] = [
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.TIMELINE,
  WidgetType.CHAT_THREADS,
];
