import { WidgetType } from '~/generated-metadata/graphql';

// Prerendered tabs mount while hidden, so only widgets that behave under display: none qualify; apps are trusted, so warming FRONT_COMPONENT and IFRAME is wanted.
// Excluded: GRAPH and RECORD_TABLE measure their container, which is zero-sized while hidden.
export const PRERENDERABLE_PAGE_LAYOUT_WIDGET_TYPES: WidgetType[] = [
  WidgetType.FIELDS,
  WidgetType.TIMELINE,
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.CHAT_THREADS,
  WidgetType.EMAILS,
  WidgetType.CALENDAR,
  WidgetType.FRONT_COMPONENT,
  WidgetType.IFRAME,
];
