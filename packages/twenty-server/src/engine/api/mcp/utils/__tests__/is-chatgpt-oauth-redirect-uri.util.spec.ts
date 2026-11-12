import { isChatGptOAuthRedirectUri } from 'src/engine/api/mcp/utils/is-chatgpt-oauth-redirect-uri.util';

describe('isChatGptOAuthRedirectUri', () => {
  it.each([
    'https://chatgpt.com/connector_platform_oauth_redirect',
    'https://chatgpt.com/connector/oauth/twenty-callback',
  ])('should recognize the official ChatGPT callback %s', (redirectUri) => {
    expect(isChatGptOAuthRedirectUri(redirectUri)).toBe(true);
  });

  it.each([
    'https://claude.ai/api/mcp/auth_callback',
    'https://chatgpt.com.example.com/connector_platform_oauth_redirect',
    'https://chatgpt.com@other.example/connector_platform_oauth_redirect',
    'http://chatgpt.com/connector_platform_oauth_redirect',
    'https://chatgpt.com/other_callback',
    'https://chatgpt.com/connector/oauth/',
    'not a URL',
  ])('should reject other or spoofed callbacks: %s', (redirectUri) => {
    expect(isChatGptOAuthRedirectUri(redirectUri)).toBe(false);
  });
});
