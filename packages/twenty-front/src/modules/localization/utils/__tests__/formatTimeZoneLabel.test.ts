import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('formatTimeZoneLabel', () => {
  it('should format the time zone label correctly when location is included in the label', () => {
    const ianaTimeZone = 'Europe/Paris';
    const expectedLabel = '(GMT+01:00) Central European Standard Time - Paris';

    const formattedLabel = formatTimeZoneLabel({ timeZone: ianaTimeZone });

    expect(expectedLabel).toEqual(formattedLabel);
  });

  it('should format the time zone label correctly when location is not included in the label', () => {
    const ianaTimeZone = 'America/New_York';
    const expectedLabel = '(GMT-05:00) Eastern Standard Time - New York';

    const formattedLabel = formatTimeZoneLabel({ timeZone: ianaTimeZone });

    expect(formattedLabel).toEqual(expectedLabel);
  });

  it('should use the reference date offset instead of the current date offset', () => {
    const formattedLabel = formatTimeZoneLabel({
      timeZone: 'Europe/Paris',
      referenceDate: new Date('2024-07-01T12:00:00.000Z'),
    });

    expect(formattedLabel).toBe(
      '(GMT+02:00) Central European Summer Time - Paris',
    );
  });

  it('should preserve the time zone identifier when it cannot be formatted', () => {
    expect(formatTimeZoneLabel({ timeZone: 'Invalid/TimeZone' })).toBe(
      'Invalid/TimeZone',
    );
  });
});
