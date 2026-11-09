import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';

describe('getPageLayoutFilterDisplayLabel', () => {
  it('should translate the built-in Date range whatever label it was stored with', () => {
    expect(
      getPageLayoutFilterDisplayLabel({
        id: DASHBOARD_DATE_RANGE_FILTER_ID,
        label: 'Période',
      }),
    ).toBe('Date range');
  });

  it('should show the stored label of any other filter', () => {
    expect(
      getPageLayoutFilterDisplayLabel({ id: 'signup', label: 'Signup date' }),
    ).toBe('Signup date');
  });
});
