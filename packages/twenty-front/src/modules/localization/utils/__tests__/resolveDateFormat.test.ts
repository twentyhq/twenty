import { DateFormat } from '@/localization/constants/DateFormat';
import { resolveDateFormat } from '@/localization/utils/resolveDateFormat';

jest.mock('@/localization/utils/detection/detectDateFormat', () => ({
  detectDateFormat: jest.fn(() => 'DAY_FIRST'),
}));

describe('resolveDateFormat', () => {
  it('should detect system format when SYSTEM is passed', () => {
    const result = resolveDateFormat(DateFormat.SYSTEM);

    expect(result).toBe(DateFormat.DAY_FIRST);
  });

  it('should return MONTH_FIRST as-is', () => {
    expect(resolveDateFormat(DateFormat.MONTH_FIRST)).toBe(
      DateFormat.MONTH_FIRST,
    );
  });

  it('should return DAY_FIRST as-is', () => {
    expect(resolveDateFormat(DateFormat.DAY_FIRST)).toBe(DateFormat.DAY_FIRST);
  });

  it('should return YEAR_FIRST as-is', () => {
    expect(resolveDateFormat(DateFormat.YEAR_FIRST)).toBe(
      DateFormat.YEAR_FIRST,
    );
  });
});
