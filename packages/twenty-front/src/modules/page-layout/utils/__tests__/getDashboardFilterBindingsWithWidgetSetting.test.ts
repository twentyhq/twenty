import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';

const getBindings = (value: string) =>
  getDashboardFilterBindingsWithWidgetSetting({
    dashboardFilterBindings: [
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: 'close-date-field',
      },
    ],
    pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
    value,
  });

describe('getDashboardFilterBindingsWithWidgetSetting', () => {
  it('should remove the entry of the filter for the default', () => {
    expect(getBindings(DASHBOARD_FILTER_DEFAULT_OPTION_VALUE)).toEqual([]);
  });

  it('should store a null field when ignored', () => {
    expect(getBindings(DASHBOARD_FILTER_IGNORED_OPTION_VALUE)).toEqual([
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: null,
      },
    ]);
  });

  it('should replace the entry of the filter with an override', () => {
    expect(getBindings('created-at-field')).toEqual([
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: 'created-at-field',
      },
    ]);
  });
});
