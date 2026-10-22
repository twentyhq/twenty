import { getOAuthRedirectTarget } from '@/auth/utils/getOAuthRedirectTarget';

describe('getOAuthRedirectTarget', () => {
  it('should return the host of an https redirect', () => {
    expect(getOAuthRedirectTarget('https://claude.ai/api/mcp/callback')).toBe(
      'claude.ai',
    );
  });

  it('should keep the port of a loopback redirect', () => {
    expect(getOAuthRedirectTarget('http://127.0.0.1:53682/callback')).toBe(
      '127.0.0.1:53682',
    );
  });

  it('should keep the scheme of a custom scheme redirect', () => {
    expect(
      getOAuthRedirectTarget(
        'cursor://anysphere.cursor-retrieval/oauth/callback',
      ),
    ).toBe('cursor://anysphere.cursor-retrieval');
  });

  it('should return null for an invalid redirect', () => {
    expect(getOAuthRedirectTarget('not a url')).toBeNull();
  });
});
