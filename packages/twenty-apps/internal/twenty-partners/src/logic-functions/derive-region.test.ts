import { describe, expect, it } from 'vitest';

import { PARTNER_COUNTRY_VALUES } from './submit-partner-application.logic-function';
import { COUNTRY_TO_REGION, deriveRegion } from './derive-region';

describe('deriveRegion', () => {
  it('maps representative countries to the right region', () => {
    expect(deriveRegion('FRANCE')).toBe('EUROPE');
    expect(deriveRegion('UNITED_STATES')).toBe('US');
    expect(deriveRegion('CANADA')).toBe('US');
    expect(deriveRegion('BRAZIL')).toBe('LATAM');
    expect(deriveRegion('SAUDI_ARABIA')).toBe('MENA');
    expect(deriveRegion('JAPAN')).toBe('APAC');
    expect(deriveRegion('NIGERIA')).toBe('AFRICA');
  });

  it('returns null for missing / unknown country', () => {
    expect(deriveRegion(undefined)).toBeNull();
    expect(deriveRegion(null)).toBeNull();
    expect(deriveRegion('ATLANTIS')).toBeNull();
  });

  it('covers every accepted country exactly once', () => {
    for (const country of PARTNER_COUNTRY_VALUES) {
      expect(COUNTRY_TO_REGION[country], `missing region for ${country}`).toBeDefined();
    }
    expect(Object.keys(COUNTRY_TO_REGION).length).toBe(PARTNER_COUNTRY_VALUES.length);
  });
});
