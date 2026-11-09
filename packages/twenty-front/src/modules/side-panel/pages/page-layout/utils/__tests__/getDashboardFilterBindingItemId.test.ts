import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';

describe('getDashboardFilterBindingItemId', () => {
  it('should build a selectable item id unique to the filter', () => {
    expect(getDashboardFilterBindingItemId('date-range')).toBe(
      'dashboard-filter-binding-date-range',
    );
  });
});
