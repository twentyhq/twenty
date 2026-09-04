import { describe, expect, it } from 'vitest';

import { getCompanyLogoUrl } from 'src/logic-functions/utils/get-company-logo-url';

describe('getCompanyLogoUrl', () => {
  it('should build a twenty-icons URL from a bare domain', () => {
    expect(getCompanyLogoUrl('acme.dev')).toBe(
      'https://twenty-icons.com/acme.dev',
    );
  });

  it('should strip the scheme, path and www prefix', () => {
    expect(getCompanyLogoUrl('https://www.acme.dev/about')).toBe(
      'https://twenty-icons.com/acme.dev',
    );
  });

  it('should handle an upper-case scheme', () => {
    expect(getCompanyLogoUrl('HTTP://acme.dev')).toBe(
      'https://twenty-icons.com/acme.dev',
    );
  });

  it('should return undefined for empty or missing input', () => {
    expect(getCompanyLogoUrl(undefined)).toBeUndefined();
    expect(getCompanyLogoUrl('   ')).toBeUndefined();
  });

  it('should return undefined for an unparsable domain', () => {
    expect(getCompanyLogoUrl('https://')).toBeUndefined();
  });
});
