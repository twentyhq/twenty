import { DASHBOARD_PERIOD_FILTER_ID } from '@/page-layout/constants/DashboardPeriodFilterId';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';

describe('getPageLayoutFilterDisplayLabel', () => {
  it('should translate the built-in Period whatever label it was stored with', () => {
    expect(
      getPageLayoutFilterDisplayLabel({
        id: DASHBOARD_PERIOD_FILTER_ID,
        label: 'Période',
      }),
    ).toBe('Period');
  });

  it('should show the stored label of any other filter', () => {
    expect(
      getPageLayoutFilterDisplayLabel({ id: 'signup', label: 'Signup date' }),
    ).toBe('Signup date');
  });
});
