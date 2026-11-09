import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('getWidgetDashboardFilterBindings', () => {
  it('should return the bindings without their typename and with null exclusions', () => {
    expect(
      getWidgetDashboardFilterBindings({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [
          {
            __typename: 'DashboardFilterBinding',
            pageLayoutFilterId: 'date-range-filter',
            fieldMetadataId: TEST_FIELD_METADATA_ID_1,
          },
          { pageLayoutFilterId: 'signup-filter' },
        ],
      }),
    ).toEqual([
      {
        pageLayoutFilterId: 'date-range-filter',
        fieldMetadataId: TEST_FIELD_METADATA_ID_1,
      },
      { pageLayoutFilterId: 'signup-filter', fieldMetadataId: null },
    ]);
  });

  it('should return no bindings for a widget that cannot have any', () => {
    expect(getWidgetDashboardFilterBindings(TEST_IFRAME_CONFIGURATION)).toEqual(
      [],
    );
  });
});
