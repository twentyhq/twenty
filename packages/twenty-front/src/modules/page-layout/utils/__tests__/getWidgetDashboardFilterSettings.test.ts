import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import {
  CLOSE_DATE_FIELD,
  OBJECT_FIELDS,
} from '@/page-layout/testing/dashboardFilterWidgetFixtures';
import { getWidgetDashboardFilterSettings } from '@/page-layout/utils/getWidgetDashboardFilterSettings';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const RECORD_TABLE_CONFIGURATION = {
  __typename: 'RecordTableConfiguration' as const,
  configurationType: WidgetConfigurationType.RECORD_TABLE,
  viewId: 'view-1',
};

describe('getWidgetDashboardFilterSettings', () => {
  it("should default to the date the widget's own filter uses", () => {
    const [setting] = getWidgetDashboardFilterSettings({
      pageLayoutFilters: [DASHBOARD_DATE_RANGE_FILTER],
      configuration: RECORD_TABLE_CONFIGURATION,
      fields: OBJECT_FIELDS,
      widgetFilter: {
        recordFilters: [
          {
            fieldMetadataId: CLOSE_DATE_FIELD.id,
            operand: ViewFilterOperand.IS_RELATIVE,
          },
        ],
        recordFilterGroups: [],
      },
    });

    expect(setting.pageLayoutFilter).toBe(DASHBOARD_DATE_RANGE_FILTER);
    expect(setting.value).toBe(DASHBOARD_FILTER_DEFAULT_OPTION_VALUE);
    expect(setting.resolution).toEqual({
      fieldMetadataId: CLOSE_DATE_FIELD.id,
      source: 'WIDGET_FILTER',
    });
  });

  it('should read an ignored binding', () => {
    const [setting] = getWidgetDashboardFilterSettings({
      pageLayoutFilters: [DASHBOARD_DATE_RANGE_FILTER],
      configuration: {
        ...RECORD_TABLE_CONFIGURATION,
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER.id,
            fieldMetadataId: null,
          },
        ],
      },
      fields: OBJECT_FIELDS,
      widgetFilter: { recordFilters: [], recordFilterGroups: [] },
    });

    expect(setting.value).toBe(DASHBOARD_FILTER_IGNORED_OPTION_VALUE);
  });
});
