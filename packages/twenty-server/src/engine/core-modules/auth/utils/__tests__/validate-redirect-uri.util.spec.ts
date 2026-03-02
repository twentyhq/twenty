import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';

describe('validateRedirectUri', () => {
  it('should accept a valid HTTPS URI', () => {
    const result = validateRedirectUri('https://example.com/callback');

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.parsed.href).toBe('https://example.com/callback');
    }
  });

  it('should accept localhost HTTP', () => {
    const result = validateRedirectUri('http://localhost:3000/callback');

    expect(result.valid).toBe(true);
  });

  it('should accept 127.0.0.1 HTTP', () => {
    const result = validateRedirectUri('http://127.0.0.1:8080/callback');

    expect(result.valid).toBe(true);
  });

  it('should reject non-HTTPS non-localhost URIs', () => {
    const result = validateRedirectUri('http://example.com/callback');

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.reason).toContain('HTTPS');
    }
  });

  it('should reject URIs with fragments', () => {
    const result = validateRedirectUri('https://example.com/callback#section');

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.reason).toContain('fragments');
    }
  });

  it('should reject invalid URIs', () => {
    const result = validateRedirectUri('not-a-url');

    expect(result.valid).toBe(false);

    if (!result.valid) {
      expect(result.reason).toContain('Invalid redirect URI');
    }
  });

  it('should accept HTTPS with query parameters', () => {
    const result = validateRedirectUri(
      'https://example.com/callback?state=abc',
    );

    expect(result.valid).toBe(true);
  });

  it('should accept HTTPS with port', () => {
    const result = validateRedirectUri('https://example.com:8443/callback');

    expect(result.valid).toBe(true);
  });
});
