import { isPageLayoutFilterDefaultValueSupported } from '@/side-panel/pages/page-layout/utils/isPageLayoutFilterDefaultValueSupported';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const relativeValue = (value: string) => ({
  conditions: [{ operand: ViewFilterOperand.IS_RELATIVE, value }],
});

const dateRangeValue = (startDate: string, dayAfterEndDate: string) => ({
  conditions: [
    { operand: ViewFilterOperand.IS_AFTER, value: startDate },
    { operand: ViewFilterOperand.IS_BEFORE, value: dayAfterEndDate },
  ],
});

describe('isPageLayoutFilterDefaultValueSupported', () => {
  it('should accept no default value', () => {
    expect(isPageLayoutFilterDefaultValueSupported(null)).toBe(true);
  });

  it('should accept relative values in day units or larger, up to 1000', () => {
    expect(
      isPageLayoutFilterDefaultValueSupported(relativeValue('THIS_1_MONTH')),
    ).toBe(true);
    expect(
      isPageLayoutFilterDefaultValueSupported(
        relativeValue('PAST_1000_DAY;;Europe/Paris;;MONDAY;;'),
      ),
    ).toBe(true);
  });

  it('should reject relative values below a day or above 1000', () => {
    expect(
      isPageLayoutFilterDefaultValueSupported(relativeValue('PAST_2_HOUR')),
    ).toBe(false);
    expect(
      isPageLayoutFilterDefaultValueSupported(relativeValue('PAST_1001_DAY')),
    ).toBe(false);
  });

  it('should accept strict plain dates only, and not year 0000', () => {
    expect(
      isPageLayoutFilterDefaultValueSupported(
        dateRangeValue('2026-01-01', '2026-04-01'),
      ),
    ).toBe(true);
    expect(
      isPageLayoutFilterDefaultValueSupported(
        dateRangeValue('0000-01-01', '2026-04-01'),
      ),
    ).toBe(false);
    expect(
      isPageLayoutFilterDefaultValueSupported(
        dateRangeValue('2026-01-01', '+010000-01-01'),
      ),
    ).toBe(false);
  });
});
