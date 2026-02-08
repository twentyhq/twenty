import { validateIanaTimeZone } from 'src/engine/core-modules/sql-sanitization/utils/validate-iana-time-zone.util';

describe('validateIanaTimeZone', () => {
  it('should accept valid IANA timezones', () => {
    expect(() => validateIanaTimeZone('America/New_York')).not.toThrow();
    expect(() => validateIanaTimeZone('Europe/London')).not.toThrow();
    expect(() => validateIanaTimeZone('Asia/Tokyo')).not.toThrow();
    expect(() => validateIanaTimeZone('Pacific/Auckland')).not.toThrow();
  });

  it('should accept UTC', () => {
    expect(() => validateIanaTimeZone('UTC')).not.toThrow();
  });

  it('should reject invalid timezone strings', () => {
    expect(() => validateIanaTimeZone("UTC'; DROP TABLE users; --")).toThrow();
    expect(() => validateIanaTimeZone("' OR 1=1 --")).toThrow();
    expect(() =>
      validateIanaTimeZone("UTC') UNION SELECT * FROM users --"),
    ).toThrow();
  });

  it('should reject arbitrary strings', () => {
    expect(() => validateIanaTimeZone('not_a_timezone')).toThrow();
    expect(() => validateIanaTimeZone('')).toThrow();
    expect(() => validateIanaTimeZone('SELECT 1')).toThrow();
  });
});
