import { getPageLayoutFilterValueLabel } from '@/page-layout/utils/getPageLayoutFilterValueLabel';
import { ViewFilterOperand } from 'twenty-shared/types';

const formatPlainDate = (plainDate: string) => `<${plainDate}>`;

const getLabel = (
  conditions: { operand: ViewFilterOperand; value: string }[],
) => getPageLayoutFilterValueLabel({ value: { conditions }, formatPlainDate });

describe('getPageLayoutFilterValueLabel', () => {
  it('should name a relative period', () => {
    expect(
      getLabel([
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_7_DAY;;Europe/Paris;;MONDAY;;',
        },
      ]),
    ).toBe('Past 7 days');
  });

  it('should name a relative period without resolving its embedded time zone', () => {
    expect(
      getLabel([
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_7_DAY;;Bad/Zone;;',
        },
      ]),
    ).toBe('Past 7 days');
  });

  it('should show an inclusive end date for a date range', () => {
    expect(
      getLabel([
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
      ]),
    ).toBe('<2026-01-01> – <2026-03-31>');
  });

  it('should name open-ended ranges, a single day and the absence of a value', () => {
    expect(
      getLabel([{ operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' }]),
    ).toBe('From <2026-01-01>');
    expect(
      getLabel([{ operand: ViewFilterOperand.IS_BEFORE, value: '2026-01-01' }]),
    ).toBe('Until <2025-12-31>');
    expect(
      getLabel([{ operand: ViewFilterOperand.IS, value: '2026-01-15' }]),
    ).toBe('<2026-01-15>');
    expect(
      getPageLayoutFilterValueLabel({ value: null, formatPlainDate }),
    ).toBe('No date range');
  });

  it('should not name only one condition of a value it cannot represent', () => {
    expect(
      getLabel([
        { operand: ViewFilterOperand.IS, value: '2026-01-15' },
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
      ]),
    ).toBe('Other value');
  });
});
