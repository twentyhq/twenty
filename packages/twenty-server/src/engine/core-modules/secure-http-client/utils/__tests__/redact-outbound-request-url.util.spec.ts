import { redactOutboundRequestUrl } from 'src/engine/core-modules/secure-http-client/utils/redact-outbound-request-url.util';

describe('redactOutboundRequestUrl', () => {
  it('keeps the origin and path', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://api.example.com:8443/v1/users'),
      ),
    ).toBe('https://api.example.com:8443/v1/users');
  });

  it('redacts every query value and keeps the parameter names', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://api.example.com/search?api_key=secret&q=a%20b&q=c'),
      ),
    ).toBe(
      'https://api.example.com/search?api_key=REDACTED&q=REDACTED&q=REDACTED',
    );
  });

  it('redacts a parameter without a value entirely', () => {
    expect(
      redactOutboundRequestUrl(
        new URL('https://api.example.com/hook?secret-token&page=1'),
      ),
    ).toBe('https://api.example.com/hook?REDACTED&page=REDACTED');
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
