import { buildPageLayoutFilterDateRangeValue } from '@/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

describe('getPageLayoutFilterDateRange', () => {
  it('should read back the inclusive range it was built from', () => {
    const dateRange = { startDate: '2026-03-01', endDate: '2026-03-31' };

    expect(
      getPageLayoutFilterDateRange(
        buildPageLayoutFilterDateRangeValue(dateRange),
      ),
    ).toEqual(dateRange);
  });

  it('should read an open-ended range', () => {
    expect(
      getPageLayoutFilterDateRange({
        conditions: [
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-01' },
        ],
      }),
    ).toEqual({ startDate: '2026-03-01', endDate: null });
  });

  it('should read no range from a relative value or no value', () => {
    const emptyDateRange = { startDate: null, endDate: null };

    expect(
      getPageLayoutFilterDateRange({
        conditions: [
          { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
        ],
      }),
    ).toEqual(emptyDateRange);
    expect(getPageLayoutFilterDateRange(null)).toEqual(emptyDateRange);
  });
});
