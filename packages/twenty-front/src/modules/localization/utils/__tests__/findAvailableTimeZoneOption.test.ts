import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toBeDefined();
    expect(option?.value).toBe('Europe/Paris');
    // We don't test the exact label since it's time-dependent (DST changes)
    expect(option?.label).toMatch(/^\(GMT[+-]\d{2}:\d{2}\) .+ - Paris$/);
  });
});
