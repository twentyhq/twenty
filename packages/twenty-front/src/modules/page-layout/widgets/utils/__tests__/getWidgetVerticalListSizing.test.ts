import {
  getWidgetVerticalListSizing,
  type WidgetVerticalListSizing,
} from '@/page-layout/widgets/utils/getWidgetVerticalListSizing';
import { WidgetType } from '~/generated-metadata/graphql';

const expectedSizingByWidgetType = {
  [WidgetType.CALENDAR]: 'FILL_VIEWPORT',
  [WidgetType.CALL_RECORDING_SUMMARY]: 'FILL_VIEWPORT',
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: 'FILL_VIEWPORT',
  [WidgetType.EMAILS]: 'FILL_VIEWPORT',
  [WidgetType.EMAIL_THREAD]: 'FILL_VIEWPORT',
  [WidgetType.FIELD]: 'FIT_CONTENT',
  [WidgetType.FIELDS]: 'FIT_CONTENT',
  [WidgetType.FIELD_RICH_TEXT]: 'FIT_CONTENT',
  [WidgetType.FILES]: 'FILL_VIEWPORT',
  [WidgetType.FRONT_COMPONENT]: 'FIT_CONTENT',
  [WidgetType.GRAPH]: 'FIT_CONTENT',
  [WidgetType.IFRAME]: 'FIT_CONTENT',
  [WidgetType.MESSAGE_CAMPAIGN_BODY]: 'FILL_VIEWPORT',
  [WidgetType.MESSAGE_CAMPAIGN_DETAILS]: 'FIT_CONTENT',
  [WidgetType.NOTES]: 'FILL_VIEWPORT',
  [WidgetType.RECORD_TABLE]: 'FIT_CONTENT',
  [WidgetType.STANDALONE_RICH_TEXT]: 'FIT_CONTENT',
  [WidgetType.TASKS]: 'FILL_VIEWPORT',
  [WidgetType.TIMELINE]: 'FILL_VIEWPORT',
  [WidgetType.VIEW]: 'FIT_CONTENT',
  [WidgetType.WORKFLOW]: 'FILL_VIEWPORT',
  [WidgetType.WORKFLOW_RUN]: 'FILL_VIEWPORT',
  [WidgetType.WORKFLOW_VERSION]: 'FILL_VIEWPORT',
} satisfies Record<WidgetType, WidgetVerticalListSizing>;

describe('getWidgetVerticalListSizing', () => {
  it.each(Object.values(WidgetType))(
    'returns the vertical-list sizing for %s',
    (widgetType) => {
      expect(getWidgetVerticalListSizing(widgetType)).toBe(
        expectedSizingByWidgetType[widgetType],
      );
    },
  );
});
