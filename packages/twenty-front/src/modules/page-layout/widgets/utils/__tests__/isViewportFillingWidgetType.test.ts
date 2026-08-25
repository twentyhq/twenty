import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { WidgetType } from '~/generated-metadata/graphql';

const expectedIsViewportFillingByWidgetType = {
  [WidgetType.CALENDAR]: true,
  [WidgetType.CALL_RECORDING_SUMMARY]: true,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: true,
  [WidgetType.EMAILS]: true,
  [WidgetType.EMAIL_THREAD]: true,
  [WidgetType.FIELD]: false,
  [WidgetType.FIELDS]: false,
  [WidgetType.FIELD_RICH_TEXT]: false,
  [WidgetType.FILES]: true,
  [WidgetType.FRONT_COMPONENT]: false,
  [WidgetType.GRAPH]: false,
  [WidgetType.IFRAME]: false,
  [WidgetType.MESSAGE_CAMPAIGN_BODY]: false,
  [WidgetType.MESSAGE_CAMPAIGN_DETAILS]: false,
  [WidgetType.NOTES]: true,
  [WidgetType.RECORD_TABLE]: false,
  [WidgetType.STANDALONE_RICH_TEXT]: false,
  [WidgetType.TASKS]: true,
  [WidgetType.TIMELINE]: true,
  [WidgetType.VIEW]: false,
  [WidgetType.WORKFLOW]: true,
  [WidgetType.WORKFLOW_RUN]: true,
  [WidgetType.WORKFLOW_VERSION]: true,
} satisfies Record<WidgetType, boolean>;

describe('isViewportFillingWidgetType', () => {
  it.each(Object.values(WidgetType))(
    'returns whether %s fills the viewport',
    (widgetType) => {
      expect(isViewportFillingWidgetType(widgetType)).toBe(
        expectedIsViewportFillingByWidgetType[widgetType],
      );
    },
  );
});
