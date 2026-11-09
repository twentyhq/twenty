import { stringifyHttpRequestHeaderValues } from 'src/engine/core-modules/tool/tools/http-tool/utils/stringify-http-request-header-values.util';

describe('stringifyHttpRequestHeaderValues', () => {
  it('should turn number and boolean header values into strings', () => {
    expect(
      stringifyHttpRequestHeaderValues({
        url: 'https://api.example.com',
        headers: { 'X-Count': 3, 'X-Flag': true, 'X-Name': 'acme' },
      }),
    ).toEqual({
      url: 'https://api.example.com',
      headers: { 'X-Count': '3', 'X-Flag': 'true', 'X-Name': 'acme' },
    });
  });

  it('should leave other values for the schema to reject', () => {
    expect(
      stringifyHttpRequestHeaderValues({ headers: { 'X-Object': { a: 1 } } }),
    ).toEqual({ headers: { 'X-Object': { a: 1 } } });
  });

  it('should return the input unchanged without headers', () => {
    const input = { url: 'https://api.example.com' };

    expect(stringifyHttpRequestHeaderValues(input)).toBe(input);
  });
});
