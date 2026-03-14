import { isValidTimeZone } from '@/localization/utils/isValidTimeZone';

describe('isValidTimeZone', () => {
  it('should return true for valid IANA timezones', () => {
    expect(isValidTimeZone('America/New_York')).toBe(true);
    expect(isValidTimeZone('Europe/Paris')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Asia/Tokyo')).toBe(true);
  });

  it('should return false for invalid timezones', () => {
    expect(isValidTimeZone('ETC/UNKNOWN')).toBe(false);
    expect(isValidTimeZone('Invalid/Timezone')).toBe(false);
    expect(isValidTimeZone('Not_A_Timezone')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});
