import { formatIanaTimeZoneLabel } from '@/getting-started/utils/formatIanaTimeZoneLabel';

describe('formatIanaTimeZoneLabel', () => {
  const winterDate = new Date('2026-01-15T12:00:00.000Z');

  it('should show the zone name with its offset', () => {
    expect(
      formatIanaTimeZoneLabel({
        timeZone: 'Europe/Paris',
        referenceDate: winterDate,
      }),
    ).toBe('Europe/Paris (GMT+01:00)');
  });

  it('should replace underscores in the zone name', () => {
    expect(
      formatIanaTimeZoneLabel({
        timeZone: 'America/Los_Angeles',
        referenceDate: winterDate,
      }),
    ).toBe('America/Los Angeles (GMT-08:00)');
  });

  it('should fall back to the raw value for an unknown zone', () => {
    expect(formatIanaTimeZoneLabel({ timeZone: 'Not/A_Zone' })).toBe(
      'Not/A_Zone',
    );
  });
});
