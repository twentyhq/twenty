import { formatTime } from '~/utils/format/formatTime';

describe('formatTime', () => {
  it('should format 24-hour time', () => {
    expect(formatTime({ hour: '9', minute: '30', use24HourFormat: true })).toBe(
      '09:30',
    );
    expect(formatTime({ hour: '14', minute: '0', use24HourFormat: true })).toBe(
      '14:00',
    );
    expect(formatTime({ hour: '0', minute: '0', use24HourFormat: true })).toBe(
      '00:00',
    );
    expect(
      formatTime({ hour: '23', minute: '59', use24HourFormat: true }),
    ).toBe('23:59');
  });

  it('should format 12-hour time', () => {
    expect(
      formatTime({ hour: '9', minute: '30', use24HourFormat: false }),
    ).toBe('9:30 AM');
    expect(
      formatTime({ hour: '14', minute: '0', use24HourFormat: false }),
    ).toBe('2:00 PM');
    expect(formatTime({ hour: '0', minute: '0', use24HourFormat: false })).toBe(
      '12:00 AM',
    );
    expect(
      formatTime({ hour: '12', minute: '0', use24HourFormat: false }),
    ).toBe('12:00 PM');
    expect(
      formatTime({ hour: '23', minute: '59', use24HourFormat: false }),
    ).toBe('11:59 PM');
  });

  it('should handle invalid inputs', () => {
    expect(
      formatTime({ hour: 'invalid', minute: '30', use24HourFormat: true }),
    ).toBe('');
    expect(
      formatTime({ hour: '9', minute: 'invalid', use24HourFormat: true }),
    ).toBe('');
    expect(formatTime({ hour: '', minute: '', use24HourFormat: true })).toBe(
      '',
    );
  });

  it('should append UTC when specified', () => {
    expect(
      formatTime({
        hour: '9',
        minute: '30',
        use24HourFormat: true,
        appendUTC: true,
      }),
    ).toBe('09:30 UTC');
    expect(
      formatTime({
        hour: '14',
        minute: '0',
        use24HourFormat: false,
        appendUTC: true,
      }),
    ).toBe('2:00 PM UTC');
  });
});
