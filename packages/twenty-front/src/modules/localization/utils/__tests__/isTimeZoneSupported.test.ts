import { isTimeZoneSupported } from '@/localization/utils/isTimeZoneSupported';

describe('isTimeZoneSupported', () => {
  it('should return true for a canonical IANA time zone', () => {
    expect(isTimeZoneSupported('Europe/Paris')).toBe(true);
  });

  it('should return false for an unknown time zone', () => {
    expect(isTimeZoneSupported('Mars/Olympus')).toBe(false);
  });
});
