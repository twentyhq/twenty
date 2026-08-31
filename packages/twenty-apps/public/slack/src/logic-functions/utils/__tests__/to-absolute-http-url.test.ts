import { describe, expect, it } from 'vitest';

import { toAbsoluteHttpUrl } from 'src/logic-functions/utils/to-absolute-http-url';

describe('toAbsoluteHttpUrl', () => {
  it('should prefix a bare domain with https', () => {
    expect(toAbsoluteHttpUrl('goo.gle')).toBe('https://goo.gle/');
  });

  it('should keep an absolute URL as is', () => {
    expect(toAbsoluteHttpUrl('https://acme.dev/about')).toBe(
      'https://acme.dev/about',
    );
    expect(toAbsoluteHttpUrl('http://acme.dev')).toBe('http://acme.dev/');
  });

  it('should return undefined for undefined input', () => {
    expect(toAbsoluteHttpUrl(undefined)).toBeUndefined();
  });

  it('should return undefined for a value that cannot become a URL', () => {
    expect(toAbsoluteHttpUrl('not a url')).toBeUndefined();
  });
});
