import { formatDateJalali } from '../formatDateJalali';

describe('formatDateJalali', () => {
  it('formats ISO date to Jalali string', () => {
    const iso = '2024-03-20T00:00:00.000Z';
    const result = formatDateJalali(iso, { locale: 'fa-IR' });
    expect(result).toBe('1403-01-01');
  });

  it('parses Jalali string to ISO date', () => {
    const jalali = '1403-01-01';
    const iso = formatDateJalali(jalali, { locale: 'fa-IR', parse: true });
    expect(iso).toBe('2024-03-20T00:00:00.000Z');
  });

  it('returns ISO date string when locale is LTR', () => {
    const iso = '2024-03-20T00:00:00.000Z';
    const result = formatDateJalali(iso, { locale: 'en-US' });
    expect(result).toBe('2024-03-20');
  });
});
