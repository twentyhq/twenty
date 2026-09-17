import { describe, expect, it } from 'vitest';

import {
  isUrlOnOneOfDomains,
  LINKEDIN_DOMAINS,
} from 'src/logic-functions/data/link-domain.util';

describe('isUrlOnOneOfDomains', () => {
  it('should match a url on the domain itself', () => {
    expect(
      isUrlOnOneOfDomains('https://linkedin.com/in/john', LINKEDIN_DOMAINS),
    ).toBe(true);
  });

  it('should match a url on a subdomain', () => {
    expect(
      isUrlOnOneOfDomains('https://www.linkedin.com/in/john', LINKEDIN_DOMAINS),
    ).toBe(true);
  });

  it('should match a url written without a scheme', () => {
    expect(isUrlOnOneOfDomains('linkedin.com/in/john', LINKEDIN_DOMAINS)).toBe(
      true,
    );
  });

  it('should not match a domain that merely ends with the same text', () => {
    expect(
      isUrlOnOneOfDomains('https://notlinkedin.com/in/john', LINKEDIN_DOMAINS),
    ).toBe(false);
  });

  it('should not match an unrelated domain', () => {
    expect(isUrlOnOneOfDomains('https://example.com', LINKEDIN_DOMAINS)).toBe(
      false,
    );
  });

  it('should not match an unparseable url', () => {
    expect(isUrlOnOneOfDomains('http://', LINKEDIN_DOMAINS)).toBe(false);
  });
});
