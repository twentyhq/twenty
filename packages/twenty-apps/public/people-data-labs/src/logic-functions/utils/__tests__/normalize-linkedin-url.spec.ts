import { describe, expect, it } from 'vitest';

import { normalizeLinkedinUrl } from 'src/logic-functions/utils/normalize-linkedin-url';

describe('normalizeLinkedinUrl', () => {
  it('canonicalizes scheme/www/trailing slash while keeping the path', () => {
    expect(normalizeLinkedinUrl('linkedin.com/company/acme')).toBe(
      'linkedin.com/company/acme',
    );
    expect(normalizeLinkedinUrl('https://www.linkedin.com/company/acme/')).toBe(
      'linkedin.com/company/acme',
    );
    expect(normalizeLinkedinUrl('HTTPS://LinkedIn.com/company/Acme')).toBe(
      'linkedin.com/company/acme',
    );
  });

  it('returns undefined for blank or missing values', () => {
    expect(normalizeLinkedinUrl('')).toBeUndefined();
    expect(normalizeLinkedinUrl(null)).toBeUndefined();
  });
});
