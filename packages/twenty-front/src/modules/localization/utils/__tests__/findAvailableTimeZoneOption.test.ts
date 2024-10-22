import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';
    const expectedOption = {
      label: '(GMT+02:00) Central European Summer Time - Paris',
      value: 'Europe/Paris',
    };

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toEqual(expectedOption);
  });
});
