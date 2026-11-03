import { isRequestInOAuthAudience } from 'src/engine/core-modules/auth/utils/is-request-in-oauth-audience.util';

describe('isRequestInOAuthAudience', () => {
  const requestBaseUrl = 'https://app.twenty.com';
  const serverUrl = 'https://api.twenty.com';

  it.each([
    ['https://app.twenty.com', '/graphql'],
    ['https://app.twenty.com/mcp', '/mcp'],
    ['https://api.twenty.com/mcp', '/mcp'],
  ])('should let a %s token reach %s', (audience, requestPath) => {
    expect(
      isRequestInOAuthAudience({
        audience,
        requestPath,
        requestBaseUrl,
        serverUrl,
      }),
    ).toBe(true);
  });

  it.each([
    ['https://app.twenty.com/mcp', '/graphql'],
    ['https://app.twenty.com/mcp', '/mcpx'],
    ['https://attacker.example.com/mcp', '/mcp'],
  ])('should keep a %s token off %s', (audience, requestPath) => {
    expect(
      isRequestInOAuthAudience({
        audience,
        requestPath,
        requestBaseUrl,
        serverUrl,
      }),
    ).toBe(false);
  });
});
