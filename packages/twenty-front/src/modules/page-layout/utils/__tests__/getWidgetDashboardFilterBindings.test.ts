import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('getWidgetDashboardFilterBindings', () => {
  it('should return an override without its typename', () => {
    expect(
      getWidgetDashboardFilterBindings({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [
          {
            __typename: 'DashboardFilterBinding',
            pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
            fieldMetadataId: TEST_FIELD_METADATA_ID_1,
          },
        ],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: TEST_FIELD_METADATA_ID_1,
      },
    ]);
  });

  it('should return an exclusion stored without a field as a null field', () => {
    expect(
      getWidgetDashboardFilterBindings({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [
          { pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID },
        ],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
        fieldMetadataId: null,
      },
    ]);
  });

  it('should return no bindings for a widget that cannot have any', () => {
    expect(getWidgetDashboardFilterBindings(TEST_IFRAME_CONFIGURATION)).toEqual(
      [],
    );
  });
});
