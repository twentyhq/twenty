import { describe, expect, it } from 'vitest';

import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

describe('toAbsoluteHttpUrl', () => {
  it('should reject values whose scheme is not http(s)', () => {
    expect(toAbsoluteHttpUrl('mailto:a@b.c')).toBeUndefined();
    expect(toAbsoluteHttpUrl('ftp://acme.dev/x')).toBeUndefined();
  });

  it('should treat a colon before digits as a port, not a scheme', () => {
    expect(toAbsoluteHttpUrl('acme.dev:8080/x')).toBe(
      'https://acme.dev:8080/x',
    );
  });

  it('should prefix a bare domain and keep an absolute URL as is', () => {
    expect(toAbsoluteHttpUrl('acme.dev')).toBe('https://acme.dev/');
    expect(toAbsoluteHttpUrl('https://acme.dev/a')).toBe('https://acme.dev/a');
  });
});
