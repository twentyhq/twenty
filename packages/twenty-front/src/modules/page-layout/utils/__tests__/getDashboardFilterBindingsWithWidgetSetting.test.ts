import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';

const SIGNUP_BINDING = {
  pageLayoutFilterId: 'signup-filter',
  fieldMetadataId: 'signed-at-field',
};

const DATE_RANGE_BINDING = {
  pageLayoutFilterId: 'date-range-filter',
  fieldMetadataId: 'close-date-field',
};

const getBindings = (value: string) =>
  getDashboardFilterBindingsWithWidgetSetting({
    dashboardFilterBindings: [DATE_RANGE_BINDING, SIGNUP_BINDING],
    pageLayoutFilterId: 'date-range-filter',
    value,
  });

describe('getDashboardFilterBindingsWithWidgetSetting', () => {
  it('should remove the entry of the filter for the default', () => {
    expect(getBindings(DASHBOARD_FILTER_DEFAULT_OPTION_VALUE)).toEqual([
      SIGNUP_BINDING,
    ]);
  });

  it('should store a null field when ignored', () => {
    expect(getBindings(DASHBOARD_FILTER_IGNORED_OPTION_VALUE)).toEqual([
      SIGNUP_BINDING,
      { pageLayoutFilterId: 'date-range-filter', fieldMetadataId: null },
    ]);
  });

  it('should replace the entry of the filter with an override', () => {
    expect(getBindings('created-at-field')).toEqual([
      SIGNUP_BINDING,
      {
        pageLayoutFilterId: 'date-range-filter',
        fieldMetadataId: 'created-at-field',
      },
    ]);
  });
});
