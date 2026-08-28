import { WidgetType } from '~/generated-metadata/graphql';

// Prerendered tabs mount for real while hidden, so only widgets known to be
// inert without user interaction are eligible: they fetch and render lists,
// load no external embeds, and grab no focus. Notably excluded: IFRAME and
// FRONT_COMPONENT (load third-party content on mount), GRAPH and RECORD_TABLE
// (measure their container, which is zero-sized under display: none).
export const PRERENDERABLE_PAGE_LAYOUT_WIDGET_TYPES: WidgetType[] = [
  WidgetType.FIELDS,
  WidgetType.TIMELINE,
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.EMAILS,
  WidgetType.CALENDAR,
];
