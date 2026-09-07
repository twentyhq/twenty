import { WidgetType } from '~/generated-metadata/graphql';

// Prerendered tabs mount for real while hidden, so only widgets that behave
// under display: none are eligible. Data cards fetch and render lists without
// grabbing focus. FRONT_COMPONENT and IFRAME boot their sandbox worker or
// embed on mount, which is the point: workspace applications are trusted, so
// warming them on hover is wanted. Excluded: GRAPH and RECORD_TABLE measure
// their container, which is zero-sized while hidden.
export const PRERENDERABLE_PAGE_LAYOUT_WIDGET_TYPES: WidgetType[] = [
  WidgetType.FIELDS,
  WidgetType.TIMELINE,
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.EMAILS,
  WidgetType.CALENDAR,
  WidgetType.FRONT_COMPONENT,
  WidgetType.IFRAME,
];
