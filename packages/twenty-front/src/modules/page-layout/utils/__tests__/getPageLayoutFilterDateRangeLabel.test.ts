import { getPageLayoutFilterDateRangeLabel } from '@/page-layout/utils/getPageLayoutFilterDateRangeLabel';
import { ViewFilterOperand } from 'twenty-shared/types';

const getLabel = (
  conditions: { operand: ViewFilterOperand; value: string }[],
) =>
  getPageLayoutFilterDateRangeLabel({
    value: { conditions },
    formatPlainDate: (plainDate) => plainDate,
  });

describe('getPageLayoutFilterDateRangeLabel', () => {
  it('should show both ends of a range, the end inclusive', () => {
    expect(
      getLabel([
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-03-02' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-29' },
      ]),
    ).toBe('2026-03-02 – 2026-03-28');
  });

  it('should name an open-ended start', () => {
    expect(
      getLabel([{ operand: ViewFilterOperand.IS_AFTER, value: '2026-03-02' }]),
    ).toBe('From 2026-03-02');
  });

  it('should name an open-ended end', () => {
    expect(
      getLabel([{ operand: ViewFilterOperand.IS_BEFORE, value: '2026-03-29' }]),
    ).toBe('Until 2026-03-28');
  });
});
