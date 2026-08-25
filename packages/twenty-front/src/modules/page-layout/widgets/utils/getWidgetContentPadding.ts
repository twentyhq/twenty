import { WidgetType } from '~/generated-metadata/graphql';

export type WidgetContentPadding = 'default' | 'none';

export const getWidgetContentPadding = (
  widgetType: WidgetType,
): WidgetContentPadding => {
  switch (widgetType) {
    case WidgetType.WORKFLOW:
    case WidgetType.WORKFLOW_RUN:
    case WidgetType.WORKFLOW_VERSION:
      return 'none';
    default:
      return 'default';
  }
};
