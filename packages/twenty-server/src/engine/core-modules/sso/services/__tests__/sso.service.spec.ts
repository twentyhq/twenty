/* @license Enterprise */

import { Issuer } from 'openid-client';

import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
  type WorkspaceSSOIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { type OIDCConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

describe('SSOService.getOIDCClient', () => {
  const buildSSOService = () => {
    const twentyConfigService = {
      get: jest.fn().mockReturnValue('https://twenty.example.com'),
    };

    const ssoService = new SSOService(
      {} as never,
      twentyConfigService as never,
      {} as never,
      {} as never,
    );

    return ssoService;
  };

  const buildOIDCIdentityProvider = (): WorkspaceSSOIdentityProviderEntity &
    OIDCConfiguration =>
    ({
      id: 'identity-provider-id',
      name: 'Test IdP',
      status: SSOIdentityProviderStatus.Active,
      type: IdentityProviderType.OIDC,
      issuer: 'https://idp.example.com',
      clientID: 'client-id',
      clientSecret: 'client-secret',
    }) as unknown as WorkspaceSSOIdentityProviderEntity & OIDCConfiguration;

  const buildIssuer = (idTokenSigningAlgValuesSupported?: string[]): Issuer =>
    new Issuer({
      issuer: 'https://idp.example.com',
      authorization_endpoint: 'https://idp.example.com/auth',
      token_endpoint: 'https://idp.example.com/token',
      jwks_uri: 'https://idp.example.com/jwks',
      ...(idTokenSigningAlgValuesSupported && {
        id_token_signing_alg_values_supported: idTokenSigningAlgValuesSupported,
      }),
    });

  it('registers the client with the algorithm the identity provider actually signs id_tokens with', () => {
    const ssoService = buildSSOService();
    const identityProvider = buildOIDCIdentityProvider();
    const issuer = buildIssuer(['ES384']);

    const client = ssoService.getOIDCClient(identityProvider, issuer);

    expect(client.metadata.id_token_signed_response_alg).toBe('ES384');
  });

  it('prefers RS256 when the identity provider supports it alongside other algorithms', () => {
    const ssoService = buildSSOService();
    const identityProvider = buildOIDCIdentityProvider();
    const issuer = buildIssuer(['ES384', 'RS256']);

    const client = ssoService.getOIDCClient(identityProvider, issuer);

    expect(client.metadata.id_token_signed_response_alg).toBe('RS256');
  });

  it('falls back to the library default when the issuer does not publish supported algorithms', () => {
    const ssoService = buildSSOService();
    const identityProvider = buildOIDCIdentityProvider();
    const issuer = buildIssuer();

    const client = ssoService.getOIDCClient(identityProvider, issuer);

    expect(client.metadata.id_token_signed_response_alg).toBe('RS256');
  });
});
