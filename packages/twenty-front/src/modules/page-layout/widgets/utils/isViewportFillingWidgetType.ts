import { WidgetType } from '~/generated-metadata/graphql';

export const isViewportFillingWidgetType = (
  widgetType: WidgetType,
): boolean => {
  switch (widgetType) {
    case WidgetType.CALENDAR:
    case WidgetType.CALL_RECORDING_SUMMARY:
    case WidgetType.CALL_RECORDING_TRANSCRIPT:
    case WidgetType.EMAILS:
    case WidgetType.EMAIL_THREAD:
    case WidgetType.FILES:
    case WidgetType.NOTES:
    case WidgetType.TASKS:
    case WidgetType.TIMELINE:
    case WidgetType.WORKFLOW:
    case WidgetType.WORKFLOW_RUN:
    case WidgetType.WORKFLOW_VERSION:
      return true;

    case WidgetType.IFRAME:
      // Iframes use a fixed height because their content height is not measurable.
      return false;

    case WidgetType.RECORD_TABLE:
      // Record tables keep their own interactive frame and are not collapsed.
      return false;

    case WidgetType.MESSAGE_CAMPAIGN_BODY:
      // Campaign documents grow with their content so the tab owns scrolling.
      return false;

    case WidgetType.MESSAGE_CAMPAIGN_DETAILS:
      // This type is classified even though it currently renders no content.
      return false;

    case WidgetType.FIELD:
    case WidgetType.FIELDS:
    case WidgetType.FIELD_RICH_TEXT:
    case WidgetType.FRONT_COMPONENT:
    case WidgetType.GRAPH:
    case WidgetType.STANDALONE_RICH_TEXT:
    case WidgetType.VIEW:
      return false;
  }
};
