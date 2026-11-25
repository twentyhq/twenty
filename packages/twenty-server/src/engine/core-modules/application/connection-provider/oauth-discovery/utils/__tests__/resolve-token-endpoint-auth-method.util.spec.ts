import { resolveTokenEndpointAuthMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/resolve-token-endpoint-auth-method.util';

describe('resolveTokenEndpointAuthMethod', () => {
  it('treats a client without a secret as public whatever it registered', () => {
    expect(
      resolveTokenEndpointAuthMethod({
        token_endpoint_auth_method: 'client_secret_basic',
      }),
    ).toBe('none');
  });

  it('keeps a registered public client public even when a secret was issued', () => {
    expect(
      resolveTokenEndpointAuthMethod({
        client_secret: 'secret',
        token_endpoint_auth_method: 'none',
      }),
    ).toBe('none');
  });

  it('uses the method the authorization server registered', () => {
    expect(
      resolveTokenEndpointAuthMethod({
        client_secret: 'secret',
        token_endpoint_auth_method: 'client_secret_post',
      }),
    ).toBe('client_secret_post');
  });

  it('defaults a confidential client to client_secret_basic', () => {
    expect(resolveTokenEndpointAuthMethod({ client_secret: 'secret' })).toBe(
      'client_secret_basic',
    );
  });
});
