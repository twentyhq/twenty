import { WidgetType } from '~/generated-metadata/graphql';

// These widgets read their records through the relation itself, so the target
// object must expose the relation field. Emails and Calendar are absent on
// purpose: they aggregate through the messaging timeline and work on objects
// without a direct participants relation (e.g. Company through its people).
// The call recording widgets are absent because they also render on the call
// recording itself, which has no relation to follow; they show their own
// unavailable state on an object that cannot reach a recording.
export const WIDGET_TYPES_REQUIRING_RELATION_FIELD: WidgetType[] = [
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.TIMELINE,
];
