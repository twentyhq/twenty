import { isOAuthResourceServedByOrigins } from 'src/engine/core-modules/application/application-oauth/utils/is-oauth-resource-served-by-origins.util';

const ORIGINS = ['https://api.twenty.com', 'https://acme.twenty.com/'];

describe('isOAuthResourceServedByOrigins', () => {
  it.each([
    'https://api.twenty.com',
    'https://api.twenty.com/',
    'https://api.twenty.com/mcp',
    'https://acme.twenty.com/mcp/',
  ])('should accept %s', (resource) => {
    expect(isOAuthResourceServedByOrigins({ resource, origins: ORIGINS })).toBe(
      true,
    );
  });

  it.each([
    'https://evil.example.com/mcp',
    'https://api.twenty.com.evil.example.com/mcp',
    'http://api.twenty.com/mcp',
    'https://api.twenty.com:8443/mcp',
    'https://api.twenty.com/mcp/other',
    'https://api.twenty.com/rest',
    'https://api.twenty.com/mcp?server=evil',
    'https://api.twenty.com/mcp#fragment',
    'https://user@api.twenty.com/mcp',
    'api.twenty.com/mcp',
    '',
  ])('should refuse %s', (resource) => {
    expect(isOAuthResourceServedByOrigins({ resource, origins: ORIGINS })).toBe(
      false,
    );
  });
});
