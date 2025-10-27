import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

// TODO: This test is flaky, datetime retrieve in its scope, if mocked will be different than the one computed to build AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL
// We should refactor our tests to start from a controlled mocked date directly within `setupTests.ts`
describe('findAvailableTimeZoneOption', () => {
  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';
    const expectedValue = 'Europe/Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toBeDefined();
    expect(option?.value).toBe(expectedValue);
    expect(option?.label).toMatch(/^\(GMT[+-]\d{2}:\d{2}\) .*- Paris$/);
    expect(option?.label).toMatch(/Central European/);
  });
});
