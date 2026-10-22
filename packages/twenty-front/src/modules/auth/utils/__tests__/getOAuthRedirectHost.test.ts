import { getOAuthRedirectHost } from '@/auth/utils/getOAuthRedirectHost';

describe('getOAuthRedirectHost', () => {
  it('should return the host of the redirect URL', () => {
    expect(getOAuthRedirectHost('https://app.example.com/callback?x=1')).toBe(
      'app.example.com',
    );
  });

  it('should keep the port of a loopback redirect URL', () => {
    expect(getOAuthRedirectHost('http://127.0.0.1:53682/callback')).toBe(
      '127.0.0.1:53682',
    );
  });

  it('should return null for a missing or invalid redirect URL', () => {
    expect(getOAuthRedirectHost(null)).toBeNull();
    expect(getOAuthRedirectHost('not a url')).toBeNull();
  });
});
