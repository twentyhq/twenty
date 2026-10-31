import { parseClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/parse-client-id-metadata-document.util';

// Published by the vendors at their client_id URLs
const CHATGPT_DOCUMENT = {
  client_id: 'https://chatgpt.com/oauth/client.json',
  client_uri: 'https://chatgpt.com/',
  redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
  token_endpoint_auth_method: 'private_key_jwt',
  token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  client_name: 'ChatGPT',
  logo_uri: 'https://persistent.oaistatic.com/sonic/misc/openai-logo.png',
  token_endpoint_auth_signing_alg: 'RS256',
  jwks_uri: 'https://chatgpt.com/oauth/jwks.json',
};

const CLAUDE_CODE_DOCUMENT = {
  client_id: 'https://claude.ai/oauth/claude-code-client-metadata',
  client_name: 'Claude Code',
  client_uri: 'https://claude.ai',
  redirect_uris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
};

describe('parseClientIdMetadataDocument', () => {
  it('accepts ChatGPT, which falls back to a public client', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CHATGPT_DOCUMENT.client_id,
        rawDocument: CHATGPT_DOCUMENT,
      }),
    ).toEqual({
      document: {
        clientId: CHATGPT_DOCUMENT.client_id,
        clientName: 'ChatGPT',
        logoUri: CHATGPT_DOCUMENT.logo_uri,
        redirectUris: CHATGPT_DOCUMENT.redirect_uris,
      },
    });
  });

  it('accepts Claude Code and its loopback callbacks', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CLAUDE_CODE_DOCUMENT.client_id,
        rawDocument: CLAUDE_CODE_DOCUMENT,
      }),
    ).toMatchObject({
      document: {
        clientName: 'Claude Code',
        redirectUris: CLAUDE_CODE_DOCUMENT.redirect_uris,
      },
    });
  });

  it('rejects a document served under another URL than its client_id', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: 'https://example.com/claude.json',
        rawDocument: CLAUDE_CODE_DOCUMENT,
      }),
    ).toEqual({ error: 'client_id does not match the document URL' });
  });

  it('rejects a client that cannot authenticate as a public client', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CHATGPT_DOCUMENT.client_id,
        rawDocument: {
          ...CHATGPT_DOCUMENT,
          token_endpoint_auth_methods_supported: ['private_key_jwt'],
        },
      }),
    ).toEqual({
      error: 'Unsupported token_endpoint_auth_method: private_key_jwt',
    });
  });

  it('rejects a document carrying a shared secret', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CLAUDE_CODE_DOCUMENT.client_id,
        rawDocument: { ...CLAUDE_CODE_DOCUMENT, client_secret: 'secret' },
      }),
    ).toEqual({ error: 'The document must not carry a shared secret' });
  });

  it('rejects missing or unsafe callbacks', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CLAUDE_CODE_DOCUMENT.client_id,
        rawDocument: { ...CLAUDE_CODE_DOCUMENT, redirect_uris: [] },
      }),
    ).toEqual({ error: 'redirect_uris must be a non-empty list of URLs' });
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CLAUDE_CODE_DOCUMENT.client_id,
        rawDocument: {
          ...CLAUDE_CODE_DOCUMENT,
          redirect_uris: ['http://example.com/callback'],
        },
      }),
    ).toHaveProperty('error');
  });

  it('rejects a document that is not a JSON object', () => {
    expect(
      parseClientIdMetadataDocument({
        clientIdMetadataDocumentUrl: CLAUDE_CODE_DOCUMENT.client_id,
        rawDocument: '<html></html>',
      }),
    ).toEqual({ error: 'The document is not a JSON object' });
  });
});
