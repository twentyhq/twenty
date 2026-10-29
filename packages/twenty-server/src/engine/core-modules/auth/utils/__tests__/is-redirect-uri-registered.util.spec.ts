import {
  isRedirectUriRegistered,
  normalizeRedirectUriForComparison,
} from 'src/engine/core-modules/auth/utils/is-redirect-uri-registered.util';

describe('isRedirectUriRegistered', () => {
  it('should match an identical redirect URI', () => {
    expect(
      isRedirectUriRegistered(
        ['https://claude.ai/api/mcp/auth_callback'],
        'https://claude.ai/api/mcp/auth_callback',
      ),
    ).toBe(true);
  });

  it('should match a loopback redirect URI on a different port', () => {
    expect(
      isRedirectUriRegistered(
        ['http://127.0.0.1:54321/callback'],
        'http://127.0.0.1:60123/callback',
      ),
    ).toBe(true);
    expect(
      isRedirectUriRegistered(
        ['http://localhost/callback'],
        'http://localhost:4000/callback',
      ),
    ).toBe(true);
  });

  it('should not match a loopback redirect URI with a different path', () => {
    expect(
      isRedirectUriRegistered(
        ['http://127.0.0.1:54321/callback'],
        'http://127.0.0.1:54321/other',
      ),
    ).toBe(false);
  });

  it('should not ignore the port of a non-loopback redirect URI', () => {
    expect(
      isRedirectUriRegistered(
        ['https://example.com:8443/callback'],
        'https://example.com:9443/callback',
      ),
    ).toBe(false);
  });
});

describe('normalizeRedirectUriForComparison', () => {
  it('should leave unparseable and custom-scheme URIs untouched', () => {
    expect(normalizeRedirectUriForComparison('not a url')).toBe('not a url');
    expect(
      normalizeRedirectUriForComparison('cursor://anysphere/callback'),
    ).toBe('cursor://anysphere/callback');
  });
});
