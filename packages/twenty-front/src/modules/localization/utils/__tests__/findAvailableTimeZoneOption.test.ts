import { findAvailableTimeZoneOption } from '@/localization/utils/findAvailableTimeZoneOption';

jest.mock(
  '@/localization/constants/AvailableTimezoneOptionsReferenceDate',
  () => ({
    AVAILABLE_TIME_ZONE_OPTIONS_REFERENCE_DATE: new Date(
      '2026-10-24T12:00:00.000Z',
    ),
  }),
);

describe('findAvailableTimeZoneOption', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should find the matching available IANA time zone select option from a given IANA time zone', () => {
    const ianaTimeZone = 'Europe/Paris';

    const option = findAvailableTimeZoneOption(ianaTimeZone);

    expect(option).toBeDefined();
    expect(option?.value).toBe('Europe/Paris');
    // We don't test the exact label since it's time-dependent (DST changes)
    expect(option?.label).toMatch(/^\(GMT[+-]\d{2}:\d{2}\) .+ - Paris$/);
  });

  it('should still find the option after a daylight saving time change', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-26T12:00:00.000Z'));

    expect(findAvailableTimeZoneOption('Europe/Paris')?.value).toBe(
      'Europe/Paris',
    );
  });
});
