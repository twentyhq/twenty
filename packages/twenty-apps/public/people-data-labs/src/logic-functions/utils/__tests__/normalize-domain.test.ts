import { describe, expect, it } from 'vitest';

import { normalizeDomain } from 'src/logic-functions/utils/normalize-domain';

describe('normalizeDomain', () => {
  it('reduces variants to the same bare host', () => {
    expect(normalizeDomain('acme.com')).toBe('acme.com');
    expect(normalizeDomain('https://www.Acme.com/')).toBe('acme.com');
    expect(normalizeDomain('HTTP://acme.com/careers')).toBe('acme.com');
    expect(normalizeDomain('www.acme.com')).toBe('acme.com');
  });

  it('returns undefined for blank or missing values', () => {
    expect(normalizeDomain('')).toBeUndefined();
    expect(normalizeDomain('   ')).toBeUndefined();
    expect(normalizeDomain(null)).toBeUndefined();
    expect(normalizeDomain(undefined)).toBeUndefined();
  });
});
