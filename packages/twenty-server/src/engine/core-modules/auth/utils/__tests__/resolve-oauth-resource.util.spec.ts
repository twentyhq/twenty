import { resolveOAuthResource } from 'src/engine/core-modules/auth/utils/resolve-oauth-resource.util';

describe('resolveOAuthResource', () => {
  const requestBaseUrl = 'https://app.twenty.com';
  const serverUrl = 'https://api.twenty.com';

  it.each([
    ['https://api.twenty.com/mcp', 'https://api.twenty.com/mcp'],
    ['https://app.twenty.com', 'https://app.twenty.com'],
    ['https://api.twenty.com/', 'https://api.twenty.com'],
    ['HTTPS://API.TWENTY.COM/mcp/', 'https://api.twenty.com/mcp'],
    ['https://api.twenty.com/mcp?mode=direct', 'https://api.twenty.com/mcp'],
  ])('should resolve %s to %s', (resource, expected) => {
    expect(resolveOAuthResource({ resource, requestBaseUrl, serverUrl })).toBe(
      expected,
    );
  });

  it.each([
    'https://attacker.example.com/mcp',
    'http://api.twenty.com/mcp',
    'https://api.twenty.com/rest',
    'https://api.twenty.com/mcp#tools',
    'api.twenty.com/mcp',
  ])('should not resolve %s', (resource) => {
    expect(
      resolveOAuthResource({ resource, requestBaseUrl, serverUrl }),
    ).toBeUndefined();
  });
});
