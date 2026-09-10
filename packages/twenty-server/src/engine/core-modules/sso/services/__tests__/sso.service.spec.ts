/* @license Enterprise */

import * as http from 'http';

import { custom, Issuer } from 'openid-client';

import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SsoService } from 'src/engine/core-modules/sso/services/sso.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  IdentityProviderType,
  type WorkspaceSsoIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

describe('SsoService', () => {
  const agent = new http.Agent();
  const secureHttpClientService = {
    getSsrfSafeAgent: jest.fn().mockReturnValue(agent),
  };

  const buildSsoService = () =>
    new SsoService(
      {} as never,
      {
        get: jest.fn().mockReturnValue('https://app.example.com'),
      } as unknown as TwentyConfigService,
      {} as BillingService,
      {} as ExceptionHandlerService,
      secureHttpClientService as unknown as SecureHttpClientService,
    );

  const oidcIdentityProvider = {
    type: IdentityProviderType.OIDC,
    id: 'idp-id',
    clientID: 'client-id',
    clientSecret: 'client-secret',
  } as WorkspaceSsoIdentityProviderEntity;

  it('routes issuer discovery through the SSRF-safe agent', () => {
    buildSsoService();

    const url = new URL(
      'https://idp.example.com/.well-known/openid-configuration',
    );

    expect(Issuer[custom.http_options](url, {})).toEqual({ agent });
    expect(secureHttpClientService.getSsrfSafeAgent).toHaveBeenCalledWith(url);
  });

  it('routes JWKS, token and userinfo requests through the SSRF-safe agent', () => {
    const ssoService = buildSsoService();
    const issuer = new Issuer({ issuer: 'https://idp.example.com' });

    const client = ssoService.getOidcClient(oidcIdentityProvider, issuer);

    const url = new URL('https://idp.example.com/token');

    expect(issuer[custom.http_options](url, {})).toEqual({ agent });
    expect(client[custom.http_options](url, {})).toEqual({ agent });
  });
});
