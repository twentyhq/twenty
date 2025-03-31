import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';
    const value = 'Europe/Paris';
    const label = '(GMT+01:00) Central European Standard Time - Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toEqual({ value, label });
  });
});
