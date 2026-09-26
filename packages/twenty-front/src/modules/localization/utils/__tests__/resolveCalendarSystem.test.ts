import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { resolveCalendarSystem } from '@/localization/utils/resolveCalendarSystem';

jest.mock('@/localization/utils/detection/detectCalendarSystem', () => ({
  detectCalendarSystem: jest.fn(() => 'PERSIAN'),
}));

describe('resolveCalendarSystem', () => {
  it('should detect the system calendar when SYSTEM is passed', () => {
    expect(resolveCalendarSystem(CalendarSystem.SYSTEM)).toBe(
      CalendarSystem.PERSIAN,
    );
  });

  it('should return an explicit calendar as-is', () => {
    expect(resolveCalendarSystem(CalendarSystem.ISLAMIC)).toBe(
      CalendarSystem.ISLAMIC,
    );
  });
});
