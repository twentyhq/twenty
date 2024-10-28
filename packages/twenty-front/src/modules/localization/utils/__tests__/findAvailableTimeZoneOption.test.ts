import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';
    const expectedValue = 'Europe/Paris';
    const expectedLabelWinter =
      '(GMT+01:00) Central European Standard Time - Paris';
    const expectedLabelSummer =
      '(GMT+02:00) Central European Summer Time - Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option.value).toEqual(expectedValue);
    expect(
      expectedLabelWinter === option.label ||
        expectedLabelSummer === option.label,
    ).toBeTruthy();
  });
});
