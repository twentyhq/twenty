import { isAllowedClientIdMetadataDocumentFetchUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-allowed-client-id-metadata-document-fetch-url.util';

describe('isAllowedClientIdMetadataDocumentFetchUrl', () => {
  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://chatgpt.com:443/oauth/client.json',
  ])('allows %s', (url) => {
    expect(isAllowedClientIdMetadataDocumentFetchUrl(url)).toBe(true);
  });

  it.each([
    'http://claude.ai/oauth/client.json',
    'https://claude.ai/',
    'https://claude.ai:8443/oauth/client.json',
    'https://localhost/oauth/client.json',
    'https://127.0.0.1/oauth/client.json',
    'https://[::1]/oauth/client.json',
    'https://user:pass@claude.ai/oauth/client.json',
    'not a url',
  ])('refuses %s', (url) => {
    expect(isAllowedClientIdMetadataDocumentFetchUrl(url)).toBe(false);
  });
});
