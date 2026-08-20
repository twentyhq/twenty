import {
  getWidgetLayoutBehavior,
  type WidgetLayoutBehavior,
} from '@/page-layout/widgets/utils/getWidgetLayoutBehavior';
import { WidgetType } from '~/generated-metadata/graphql';

const expectedBehaviorByWidgetType = {
  [WidgetType.CALENDAR]: 'TAB_VIEWPORT',
  [WidgetType.CALL_RECORDING_SUMMARY]: 'TAB_VIEWPORT',
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: 'TAB_VIEWPORT',
  [WidgetType.EMAILS]: 'TAB_VIEWPORT',
  [WidgetType.EMAIL_THREAD]: 'TAB_VIEWPORT',
  [WidgetType.FIELD]: 'EXPANDABLE',
  [WidgetType.FIELDS]: 'EXPANDABLE',
  [WidgetType.FIELD_RICH_TEXT]: 'EXPANDABLE',
  [WidgetType.FILES]: 'TAB_VIEWPORT',
  [WidgetType.FRONT_COMPONENT]: 'EXPANDABLE',
  [WidgetType.GRAPH]: 'EXPANDABLE',
  [WidgetType.IFRAME]: 'EXPANDABLE',
  [WidgetType.MESSAGE_CAMPAIGN_BODY]: 'TAB_VIEWPORT',
  [WidgetType.MESSAGE_CAMPAIGN_DETAILS]: 'EXPANDABLE',
  [WidgetType.NOTES]: 'TAB_VIEWPORT',
  [WidgetType.RECORD_TABLE]: 'EXPANDABLE',
  [WidgetType.STANDALONE_RICH_TEXT]: 'EXPANDABLE',
  [WidgetType.TASKS]: 'TAB_VIEWPORT',
  [WidgetType.TIMELINE]: 'TAB_VIEWPORT',
  [WidgetType.VIEW]: 'EXPANDABLE',
  [WidgetType.WORKFLOW]: 'TAB_VIEWPORT',
  [WidgetType.WORKFLOW_RUN]: 'TAB_VIEWPORT',
  [WidgetType.WORKFLOW_VERSION]: 'TAB_VIEWPORT',
} satisfies Record<WidgetType, WidgetLayoutBehavior>;

describe('getWidgetLayoutBehavior', () => {
  it.each(Object.values(WidgetType))(
    'returns the intrinsic layout behavior for %s',
    (widgetType) => {
      expect(getWidgetLayoutBehavior(widgetType)).toBe(
        expectedBehaviorByWidgetType[widgetType],
      );
    },
  );
});
