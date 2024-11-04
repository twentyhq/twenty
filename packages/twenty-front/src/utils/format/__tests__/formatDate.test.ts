import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '../formatDate';

describe('formatToHumanReadableMonth', () => {
  it('should format the date to a human-readable month', () => {
    const date = new Date('2022-01-01');
    const result = formatToHumanReadableMonth(date, 'UTC');
    expect(result).toBe('Jan');
  });
});

describe('formatToHumanReadableDay', () => {
  it('should format the date to a human-readable day', () => {
    const date = new Date('2022-01-01');
    const result = formatToHumanReadableDay(date, 'UTC');
    expect(result).toBe('1');
  });
});

describe('formatToHumanReadableTime', () => {
  it('should format the date to a human-readable time', () => {
    const date = new Date('2022-01-01T12:30:00Z');
    const result = formatToHumanReadableTime(date, 'UTC');

    expect(['12:30 PM', '12:30 PM', '12:30 p.m.']).toContain(result);
  });
});
