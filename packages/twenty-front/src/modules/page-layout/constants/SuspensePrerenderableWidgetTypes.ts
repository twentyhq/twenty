import { WidgetType } from '~/generated-metadata/graphql';

// First-party data widgets that fetch through suspense hooks, so a hidden
// <Activity> prerenders them fully while their effects (SSE subscriptions)
// stay off until the tab is shown.
export const SUSPENSE_PRERENDERABLE_WIDGET_TYPES: WidgetType[] = [
  WidgetType.FIELDS,
  WidgetType.TIMELINE,
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.EMAILS,
  WidgetType.CALENDAR,
];
