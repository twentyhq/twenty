import { describe, expect, it } from 'vitest';

import { isHttpUrl, optionalHttpUrl } from './http-url';

describe('isHttpUrl', () => {
  it('accepts http and https', () => {
    expect(isHttpUrl('http://example.com')).toBe(true);
    expect(isHttpUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('rejects javascript:, data:, and other schemes', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isHttpUrl('mailto:a@b.com')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });
});

describe('optionalHttpUrl', () => {
  it('treats empty string as null (clear the field)', () => {
    expect(optionalHttpUrl.parse('')).toBeNull();
  });

  it('passes a valid https url through', () => {
    expect(optionalHttpUrl.parse('https://example.com')).toBe('https://example.com');
  });

  it('passes a valid http url through', () => {
    expect(optionalHttpUrl.parse('http://example.com')).toBe('http://example.com');
  });

  it('treats null as null (the schema is nullable)', () => {
    expect(optionalHttpUrl.parse(null)).toBeNull();
  });

  it('rejects a javascript: url', () => {
    expect(optionalHttpUrl.safeParse('javascript:alert(1)').success).toBe(false);
  });
});
