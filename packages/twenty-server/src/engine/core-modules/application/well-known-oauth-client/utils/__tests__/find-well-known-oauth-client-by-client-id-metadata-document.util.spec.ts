import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { findWellKnownOAuthClientByClientIdMetadataDocument } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-client-id-metadata-document.util';

describe('findWellKnownOAuthClientByClientIdMetadataDocument', () => {
  it('recognizes ChatGPT by its document host and callbacks', () => {
    expect(
      findWellKnownOAuthClientByClientIdMetadataDocument({
        clientId: 'https://chatgpt.com/oauth/client.json',
        redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
      })?.client,
    ).toBe(WellKnownOAuthClient.CHATGPT);
  });

  it('recognizes Claude on any claude.ai document URL', () => {
    expect(
      findWellKnownOAuthClientByClientIdMetadataDocument({
        clientId: 'https://claude.ai/oauth/mcp-client-metadata',
        redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
      })?.client,
    ).toBe(WellKnownOAuthClient.CLAUDE);
  });

  it('keeps Claude Code, which signs in through loopback callbacks, apart', () => {
    expect(
      findWellKnownOAuthClientByClientIdMetadataDocument({
        clientId: 'https://claude.ai/oauth/claude-code-client-metadata',
        redirectUris: [
          'http://localhost/callback',
          'http://127.0.0.1/callback',
        ],
      }),
    ).toBeUndefined();
  });

  it('ignores a document hosted elsewhere that lists vendor callbacks', () => {
    expect(
      findWellKnownOAuthClientByClientIdMetadataDocument({
        clientId: 'https://example.com/claude.json',
        redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
      }),
    ).toBeUndefined();
  });
});
