import { formatDisplayDate } from '~/utils/format/formatDisplayDate';

describe('formatDisplayDate', () => {
  it('Should format January 1 2000 correctly', () => {
    expect(formatDisplayDate('2000-01-01T00:00:00+00:00')).toEqual(
      'Jan 1, 2000',
    );
  });

  it('Should return empty string if invalid date', () => {
    expect(formatDisplayDate('abc')).toEqual('');
  });

  it('Should format a past year with short month and year', () => {
    expect(formatDisplayDate('1999-12-25T12:00:00Z')).toEqual('Dec 25, 1999');
  });

  it('Should format a date in the current year with full month name', () => {
    const now = new Date();
    const testDate = new Date(now.getFullYear(), 6, 4); // July 4 of current year
    expect(formatDisplayDate(testDate.toISOString())).toEqual('July 4');
  });

  it('Should format leap day correctly (Feb 29, 2020)', () => {
    expect(formatDisplayDate('2020-02-29T05:00:00Z')).toEqual('Feb 29, 2020');
  });

  it('Should format January 1 of current year without year', () => {
    const now = new Date();
    const testDate = new Date(now.getFullYear(), 0, 1);
    expect(formatDisplayDate(testDate.toISOString())).toEqual('January 1');
  });

  it('Should format today’s date in current year with month and day only', () => {
    const now = new Date();
    const expected = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
    }).format(now);
    expect(formatDisplayDate(now.toISOString())).toEqual(expected);
  });
});
