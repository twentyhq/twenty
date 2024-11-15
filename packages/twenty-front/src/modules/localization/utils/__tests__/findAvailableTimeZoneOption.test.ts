import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';
jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';
    const value = 'Europe/Paris';
    const label = '(GMT+01:00) Central European Standard Time - Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toEqual({ value, label });
  });
});
