import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';

describe('getRelativeDateDisplayValue', () => {
  it('should separate the words of a THIS period with a single space', () => {
    expect(
      getRelativeDateDisplayValue({ direction: 'THIS', unit: 'MONTH' }),
    ).toBe('This month');
  });

  it('should pluralize the unit of a period longer than one', () => {
    expect(
      getRelativeDateDisplayValue({
        direction: 'PAST',
        amount: 30,
        unit: 'DAY',
      }),
    ).toBe('Past 30 days');
  });
});
