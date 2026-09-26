import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '~/utils/format/formatDate';

describe('formatToHumanReadableMonth', () => {
  it('should format the date to a human-readable month', () => {
    const date = new Date('2022-01-01');
    const result = formatToHumanReadableMonth(
      date,
      'UTC',
      CalendarSystem.GREGORIAN,
    );
    expect(result).toBe('Jan');
  });
});

describe('formatToHumanReadableDay', () => {
  it('should format the date to a human-readable day', () => {
    const date = new Date('2022-01-01');
    const result = formatToHumanReadableDay(
      date,
      'UTC',
      CalendarSystem.GREGORIAN,
    );
    expect(result).toBe('1');
  });
});

describe('non-Gregorian calendar systems', () => {
  it('should format month and day in the Persian calendar', () => {
    const date = new Date('2026-09-26T12:00:00Z');

    expect(formatToHumanReadableDay(date, 'UTC', CalendarSystem.PERSIAN)).toBe(
      '4',
    );
    expect(
      formatToHumanReadableMonth(date, 'UTC', CalendarSystem.PERSIAN),
    ).toBe('Mehr');
  });
});

describe('formatToHumanReadableTime', () => {
  it('should format the date to a human-readable time', () => {
    const date = new Date('2022-01-01T12:30:00Z');
    const result = formatToHumanReadableTime(date, 'UTC');

    expect(['12:30 PM', '12:30 PM', '12:30 p.m.']).toContain(result);
  });
});
