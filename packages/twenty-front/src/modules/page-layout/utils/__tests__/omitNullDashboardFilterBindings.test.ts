import { omitNullDashboardFilterBindings } from '@/page-layout/utils/omitNullDashboardFilterBindings';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('omitNullDashboardFilterBindings', () => {
  it('should drop null bindings', () => {
    expect(
      omitNullDashboardFilterBindings({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: null,
      }),
    ).not.toHaveProperty('dashboardFilterBindings');
  });

  it('should keep a list of bindings', () => {
    const dashboardFilterBindings = [
      { pageLayoutFilterId: 'date-range', fieldMetadataId: null },
    ];

    expect(
      omitNullDashboardFilterBindings({
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings,
      }),
    ).toMatchObject({ dashboardFilterBindings });
  });

  it('should return a configuration without the key unchanged', () => {
    expect(omitNullDashboardFilterBindings(TEST_IFRAME_CONFIGURATION)).toBe(
      TEST_IFRAME_CONFIGURATION,
    );
  });
});
