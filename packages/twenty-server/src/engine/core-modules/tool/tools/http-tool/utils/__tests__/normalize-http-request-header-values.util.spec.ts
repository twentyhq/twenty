import { normalizeHttpRequestHeaderValues } from 'src/engine/core-modules/tool/tools/http-tool/utils/normalize-http-request-header-values.util';

describe('normalizeHttpRequestHeaderValues', () => {
  it('should turn number and boolean header values into strings', () => {
    expect(
      normalizeHttpRequestHeaderValues({
        url: 'https://api.example.com',
        headers: { 'X-Count': 3, 'X-Flag': true, 'X-Name': 'acme' },
      }),
    ).toEqual({
      url: 'https://api.example.com',
      headers: { 'X-Count': '3', 'X-Flag': 'true', 'X-Name': 'acme' },
    });
  });

  it('should drop null and undefined header values', () => {
    expect(
      normalizeHttpRequestHeaderValues({
        headers: { 'X-Null': null, 'X-Undefined': undefined, 'X-Name': 'acme' },
      }),
    ).toEqual({ headers: { 'X-Name': 'acme' } });
  });

  it('should leave other values for the schema to reject', () => {
    expect(
      normalizeHttpRequestHeaderValues({
        headers: { 'X-Object': { a: 1 }, 'X-Array': ['a', 'b'] },
      }),
    ).toEqual({ headers: { 'X-Object': { a: 1 }, 'X-Array': ['a', 'b'] } });
  });

  it('should return the input unchanged without headers', () => {
    const input = { url: 'https://api.example.com' };

    expect(normalizeHttpRequestHeaderValues(input)).toBe(input);
  });
});
