import { describe, expect, it } from 'vitest';

import { isCaseStudy } from './content-type';

describe('isCaseStudy', () => {
  it('returns true when the array contains CASE_STUDY', () => {
    expect(isCaseStudy(['CASE_STUDY'])).toBe(true);
    expect(isCaseStudy(['PARTNER_QUOTE', 'CASE_STUDY'])).toBe(true);
  });

  it('returns false when the array does not contain CASE_STUDY', () => {
    expect(isCaseStudy(['PARTNER_QUOTE'])).toBe(false);
    expect(isCaseStudy(['CUSTOMER_QUOTE', 'LOGO'])).toBe(false);
    expect(isCaseStudy([])).toBe(false);
  });

  it('returns true when passed the scalar value CASE_STUDY', () => {
    expect(isCaseStudy('CASE_STUDY')).toBe(true);
  });

  it('returns false for a different scalar value', () => {
    expect(isCaseStudy('PARTNER_QUOTE')).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(isCaseStudy(null)).toBe(false);
    expect(isCaseStudy(undefined)).toBe(false);
  });
});
