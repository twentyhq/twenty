import { isVerifiedOAuthClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/utils/is-verified-oauth-client-id-metadata-document-url.util';

describe('isVerifiedOAuthClientIdMetadataDocumentUrl', () => {
  it.each([
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata',
    'https://chatgpt.com/oauth/client.json',
  ])('should match %s', (clientId) => {
    expect(isVerifiedOAuthClientIdMetadataDocumentUrl(clientId)).toBe(true);
  });

  it.each([
    'https://claude.ai/oauth/another-client-metadata',
    'https://claude.ai/oauth/mcp-oauth-client-metadata/',
    'https://claude.ai/oauth/mcp-oauth-client-metadata?x=1',
    'https://CLAUDE.AI/oauth/mcp-oauth-client-metadata',
    'https://chatgpt.com.example.com/oauth/client.json',
    'http://chatgpt.com/oauth/client.json',
    '20202020-82da-4d5a-afd2-53c52090f5e1',
  ])('should not match %s', (clientId) => {
    expect(isVerifiedOAuthClientIdMetadataDocumentUrl(clientId)).toBe(false);
  });
});
