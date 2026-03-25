import { isListValue } from '~/utils/validation/isListValue';

describe('isListValue', () => {
  it('should detect list values', () => {
    expect(isListValue('1,2,3')).toBe(true);
    expect(isListValue('0,15,30,45')).toBe(true);
    expect(isListValue('1,5')).toBe(true);
  });

  it('should reject non-list values', () => {
    expect(isListValue('*')).toBe(false);
    expect(isListValue('*/5')).toBe(false);
    expect(isListValue('1-5')).toBe(false);
    expect(isListValue('15')).toBe(false);
  });
});
