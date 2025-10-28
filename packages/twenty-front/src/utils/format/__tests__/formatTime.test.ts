import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('should format 24-hour time', () => {
    expect(formatTime('9', '30', true)).toBe('09:30');
    expect(formatTime('14', '0', true)).toBe('14:00');
    expect(formatTime('0', '0', true)).toBe('00:00');
    expect(formatTime('23', '59', true)).toBe('23:59');
  });

  it('should format 12-hour time', () => {
    expect(formatTime('9', '30', false)).toBe('9:30 AM');
    expect(formatTime('14', '0', false)).toBe('2:00 PM');
    expect(formatTime('0', '0', false)).toBe('12:00 AM');
    expect(formatTime('12', '0', false)).toBe('12:00 PM');
    expect(formatTime('23', '59', false)).toBe('11:59 PM');
  });

  it('should handle invalid inputs', () => {
    expect(formatTime('invalid', '30', true)).toBe('');
    expect(formatTime('9', 'invalid', true)).toBe('');
    expect(formatTime('', '', true)).toBe('');
  });
});
