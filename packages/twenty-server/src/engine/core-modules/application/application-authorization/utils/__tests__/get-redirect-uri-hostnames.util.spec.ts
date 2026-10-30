import { getRedirectUriHostnames } from 'src/engine/core-modules/application/application-authorization/utils/get-redirect-uri-hostnames.util';

describe('getRedirectUriHostnames', () => {
  it('returns each hostname once', () => {
    expect(
      getRedirectUriHostnames([
        'https://claude.ai/api/mcp/auth_callback',
        'https://claude.ai/other_callback',
        'https://claude.com/api/mcp/auth_callback',
      ]),
    ).toEqual(['claude.ai', 'claude.com']);
  });

  it('skips redirect URIs that are not URLs', () => {
    expect(
      getRedirectUriHostnames([
        'not a url',
        'https://chatgpt.com/connector_platform_oauth_redirect',
      ]),
    ).toEqual(['chatgpt.com']);
  });

  it('returns no hostname without redirect URIs', () => {
    expect(getRedirectUriHostnames([])).toEqual([]);
  });
});
