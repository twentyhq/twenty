import { buildPageLayoutFilterDateRangeValue } from '@/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

describe('buildPageLayoutFilterDateRangeValue', () => {
  it('should store an inclusive range as IS_AFTER the start and IS_BEFORE the day after the end', () => {
    expect(
      buildPageLayoutFilterDateRangeValue({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }),
    ).toEqual({
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2027-01-01' },
      ],
    });
  });

  it('should store an open-ended range as a single condition', () => {
    expect(
      buildPageLayoutFilterDateRangeValue({
        startDate: null,
        endDate: '2026-02-28',
      }),
    ).toEqual({
      conditions: [
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-01' },
      ],
    });
  });

  it('should store no default value when both bounds are empty', () => {
    expect(
      buildPageLayoutFilterDateRangeValue({ startDate: null, endDate: '' }),
    ).toBeNull();
  });
});
