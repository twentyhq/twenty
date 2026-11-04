import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { findWellKnownOAuthClientByRedirectUris } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-redirect-uris.util';

describe('findWellKnownOAuthClientByRedirectUris', () => {
  it('recognizes Claude by its callback', () => {
    expect(
      findWellKnownOAuthClientByRedirectUris([
        'https://claude.ai/api/mcp/auth_callback',
      ])?.client,
    ).toBe(WellKnownOAuthClient.CLAUDE);
  });

  it('recognizes ChatGPT by its stable and per-connection callbacks', () => {
    expect(
      findWellKnownOAuthClientByRedirectUris([
        'https://chatgpt.com/connector_platform_oauth_redirect',
        'https://chatgpt.com/connector/oauth/abc_123-XYZ',
      ])?.client,
    ).toBe(WellKnownOAuthClient.CHATGPT);
  });

  it('ignores a client listing a vendor callback next to its own', () => {
    expect(
      findWellKnownOAuthClientByRedirectUris([
        'https://claude.ai/api/mcp/auth_callback',
        'https://attacker.example.com/callback',
      ]),
    ).toBeUndefined();
  });

  it('ignores other paths on the vendor host', () => {
    expect(
      findWellKnownOAuthClientByRedirectUris([
        'https://claude.ai/some/other/callback',
      ]),
    ).toBeUndefined();
    expect(
      findWellKnownOAuthClientByRedirectUris([
        'https://chatgpt.com/connector/oauth/abc/extra',
      ]),
    ).toBeUndefined();
  });

  it('ignores a client without callbacks', () => {
    expect(findWellKnownOAuthClientByRedirectUris([])).toBeUndefined();
  });
});
