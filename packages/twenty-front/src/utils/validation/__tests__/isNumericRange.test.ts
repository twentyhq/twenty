import { isNumericRange } from '~/utils/validation/isNumericRange';

describe('isNumericRange', () => {
  it('should detect numeric ranges', () => {
    expect(isNumericRange('1-5')).toBe(true);
    expect(isNumericRange('10-20')).toBe(true);
    expect(isNumericRange('0-59')).toBe(true);
  });

  it('should detect single numbers', () => {
    expect(isNumericRange('15')).toBe(true);
    expect(isNumericRange('0')).toBe(true);
  });

  it('should reject non-numeric ranges', () => {
    expect(isNumericRange('*')).toBe(false);
    expect(isNumericRange('*/5')).toBe(false);
    expect(isNumericRange('1,2,3')).toBe(false);
    expect(isNumericRange('invalid')).toBe(false);
  });
});
