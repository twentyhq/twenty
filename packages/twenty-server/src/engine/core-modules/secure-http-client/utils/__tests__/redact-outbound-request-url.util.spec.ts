import { redactOutboundRequestUrl } from 'src/engine/core-modules/secure-http-client/utils/redact-outbound-request-url.util';

describe('redactOutboundRequestUrl', () => {
  it('keeps the origin and path', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://api.example.com:8443/v1/users'),
      ),
    ).toBe('https://api.example.com:8443/v1/users');
  });

  it('drops the query string', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://api.example.com/search?api_key=secret&q=a%20b'),
      ),
    ).toBe('https://api.example.com/search');
  });

  it('drops credentials and fragments', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://user:password@api.example.com/path#access_token=abc'),
      ),
    ).toBe('https://api.example.com/path');
  });

  it('logs only the scheme of other protocols', () => {
    expect(
      redactOutboundRequestUrl(new URL('data:text/plain;base64,c2VjcmV0')),
    ).toBe('data:');
  });
});
