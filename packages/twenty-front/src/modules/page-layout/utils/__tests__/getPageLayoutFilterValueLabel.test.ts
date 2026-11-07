import { getPageLayoutFilterValueLabel } from '@/page-layout/utils/getPageLayoutFilterValueLabel';
import { ViewFilterOperand } from 'twenty-shared/types';

const formatPlainDate = (plainDate: string) => `<${plainDate}>`;

describe('getPageLayoutFilterValueLabel', () => {
  it('should name a relative period', () => {
    expect(
      getPageLayoutFilterValueLabel({
        value: {
          conditions: [
            {
              operand: ViewFilterOperand.IS_RELATIVE,
              value: 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;',
            },
          ],
        },
        formatPlainDate,
      }),
    ).toBe('This month');
  });

  it('should show an inclusive end date for a date range', () => {
    expect(
      getPageLayoutFilterValueLabel({
        value: {
          conditions: [
            { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
            { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
          ],
        },
        formatPlainDate,
      }),
    ).toBe('<2026-01-01> – <2026-03-31>');
  });

  it('should name open-ended ranges and the absence of a value', () => {
    expect(
      getPageLayoutFilterValueLabel({
        value: {
          conditions: [
            { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
          ],
        },
        formatPlainDate,
      }),
    ).toBe('From <2026-01-01>');
    expect(
      getPageLayoutFilterValueLabel({ value: null, formatPlainDate }),
    ).toBe('All time');
  });
});
