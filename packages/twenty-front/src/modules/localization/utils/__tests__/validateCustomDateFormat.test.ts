import { validateCustomDateFormat } from '@/localization/utils/validateCustomDateFormat';

describe('validateCustomDateFormat', () => {
  it('should return true for valid date-fns format strings', () => {
    expect(validateCustomDateFormat('yyyy-MM-dd')).toBe(true);
    expect(validateCustomDateFormat('MMMM do, yyyy')).toBe(true);
  });

  it('should return false for invalid format strings', () => {
    expect(validateCustomDateFormat('invalid format')).toBe(false);
  });
});
