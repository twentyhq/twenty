import { DASHBOARD_FILTER_AUTOMATIC_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterAutomaticOptionValue';
import { DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterNotAppliedOptionValue';
import { getDashboardFilterBindingsWithWidgetSetting } from '@/page-layout/utils/getDashboardFilterBindingsWithWidgetSetting';

const SIGNUP_BINDING = {
  pageLayoutFilterId: 'signup-filter',
  fieldMetadataId: 'signed-at-field',
};

const PERIOD_BINDING = {
  pageLayoutFilterId: 'period-filter',
  fieldMetadataId: 'close-date-field',
};

const getBindings = (value: string) =>
  getDashboardFilterBindingsWithWidgetSetting({
    dashboardFilterBindings: [PERIOD_BINDING, SIGNUP_BINDING],
    pageLayoutFilterId: 'period-filter',
    value,
  });

describe('getDashboardFilterBindingsWithWidgetSetting', () => {
  it('should remove the entry of the filter for automatic', () => {
    expect(getBindings(DASHBOARD_FILTER_AUTOMATIC_OPTION_VALUE)).toEqual([
      SIGNUP_BINDING,
    ]);
  });

  it('should store a null field for not applied', () => {
    expect(getBindings(DASHBOARD_FILTER_NOT_APPLIED_OPTION_VALUE)).toEqual([
      SIGNUP_BINDING,
      { pageLayoutFilterId: 'period-filter', fieldMetadataId: null },
    ]);
  });

  it('should replace the entry of the filter with an override', () => {
    expect(getBindings('created-at-field')).toEqual([
      SIGNUP_BINDING,
      {
        pageLayoutFilterId: 'period-filter',
        fieldMetadataId: 'created-at-field',
      },
    ]);
  });
});
